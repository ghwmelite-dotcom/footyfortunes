/**
 * User Picks Handlers
 * Handles user pick placement, tracking, stats, and gamification
 */

import { successResponse, errorResponse } from '../utils/response.js';

// ============================================================================
// PLACE A PICK (User selects a prediction and places a bet)
// ============================================================================

export async function handlePlacePick(request, env, user) {
  try {
    const { prediction_id, stake_amount, notes } = await request.json();

    // Validation
    if (!prediction_id || !stake_amount) {
      return errorResponse('Prediction ID and stake amount are required', 400);
    }

    if (stake_amount <= 0) {
      return errorResponse('Stake amount must be greater than 0', 400);
    }

    // Check if prediction exists and is still valid
    const prediction = await env.DB.prepare(`
      SELECT p.*, m.match_date, m.status
      FROM ai_predictions p
      JOIN matches m ON p.match_id = m.id
      WHERE p.id = ? AND m.match_date >= date("now") AND m.status = 'NS'
    `).bind(prediction_id).first();

    if (!prediction) {
      return errorResponse('Prediction not found or match has already started', 404);
    }

    // Get user's current bankroll
    const userStats = await env.DB.prepare(
      'SELECT current_bankroll FROM user_betting_stats WHERE user_id = ?'
    ).bind(user.id).first();

    if (!userStats) {
      return errorResponse('User stats not found', 404);
    }

    if (userStats.current_bankroll < stake_amount) {
      return errorResponse(`Insufficient bankroll. Available: GH₵${userStats.current_bankroll}`, 400);
    }

    // Check if user already has a pick for this prediction
    const existingPick = await env.DB.prepare(
      'SELECT id FROM user_picks WHERE user_id = ? AND prediction_id = ?'
    ).bind(user.id, prediction_id).first();

    if (existingPick) {
      return errorResponse('You have already placed a pick on this prediction', 409);
    }

    // Calculate potential return (simplified - would normally use odds)
    // For now, use a simple multiplier based on confidence
    const confidenceMultiplier = prediction.confidence >= 80 ? 1.5 : 
                                  prediction.confidence >= 70 ? 1.8 : 
                                  prediction.confidence >= 60 ? 2.2 : 2.5;
    const potential_return = stake_amount * confidenceMultiplier;

    // Place the pick
    const result = await env.DB.prepare(`
      INSERT INTO user_picks (
        user_id, prediction_id, match_id, stake_amount, potential_return,
        confidence_at_time, predicted_outcome, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      user.id,
      prediction_id,
      prediction.match_id,
      stake_amount,
      potential_return,
      prediction.confidence,
      prediction.predicted_winner,
      notes || null
    ).run();

    // Check for achievements
    await checkAndUnlockAchievements(env, user.id);

    // Fetch the created pick with match details
    const pick = await env.DB.prepare(`
      SELECT 
        up.*,
        ht.name as home_team_name,
        at.name as away_team_name,
        ht.logo as home_team_logo,
        at.logo as away_team_logo,
        l.name as league_name,
        l.logo as league_logo,
        m.match_time,
        ap.confidence as current_confidence
      FROM user_picks up
      JOIN ai_predictions ap ON up.prediction_id = ap.id
      JOIN matches m ON up.match_id = m.id
      JOIN leagues l ON m.league_id = l.id
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      WHERE up.id = ?
    `).bind(result.meta.last_row_id).first();

    return successResponse({
      pick: pick,
      new_bankroll: userStats.current_bankroll - stake_amount
    }, 'Pick placed successfully');

  } catch (error) {
    console.error('Error placing pick:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return errorResponse(`Failed to place pick: ${error.message}`, 500);
  }
}

// ============================================================================
// GET USER'S PICKS
// ============================================================================

export async function handleGetUserPicks(request, env, user) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'all';
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    let query = `
      SELECT 
        up.*,
        ap.home_team_name,
        ap.away_team_name,
        ap.home_team_logo,
        ap.away_team_logo,
        ap.league_name,
        ap.league_logo,
        ap.match_time,
        ap.confidence as current_confidence,
        ap.predicted_winner,
        ap.is_live,
        ap.is_finished,
        ap.home_score,
        ap.away_score
      FROM user_picks up
      JOIN ai_predictions ap ON up.prediction_id = ap.id
      WHERE up.user_id = ?
    `;

    const params = [user.id];

    if (status !== 'all') {
      query += ' AND up.status = ?';
      params.push(status);
    }

    query += ' ORDER BY up.placed_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const picks = await env.DB.prepare(query).bind(...params).all();

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM user_picks WHERE user_id = ?';
    const countParams = [user.id];
    
    if (status !== 'all') {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const { total } = await env.DB.prepare(countQuery).bind(...countParams).first();

    return successResponse({
      picks: picks.results,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + picks.results.length < total
      }
    });

  } catch (error) {
    console.error('Error fetching user picks:', error);
    return errorResponse('Failed to fetch picks', 500);
  }
}

// ============================================================================
// GET USER STATISTICS
// ============================================================================

export async function handleGetUserStats(request, env, user) {
  try {
    // Get betting stats
    const stats = await env.DB.prepare(
      'SELECT * FROM user_betting_stats WHERE user_id = ?'
    ).bind(user.id).first();

    // Get level info
    const level = await env.DB.prepare(
      'SELECT * FROM user_levels WHERE user_id = ?'
    ).bind(user.id).first();

    // Get achievements count
    const achievementsCount = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ? AND is_completed = 1'
    ).bind(user.id).first();

    // Get recent picks performance (last 10)
    const recentPicks = await env.DB.prepare(`
      SELECT status, COUNT(*) as count
      FROM user_picks
      WHERE user_id = ? AND status IN ('won', 'lost')
      ORDER BY settled_at DESC
      LIMIT 10
    `).bind(user.id).all();

    // Calculate recent form
    const recentWins = recentPicks.results.find(r => r.status === 'won')?.count || 0;
    const recentTotal = recentPicks.results.reduce((sum, r) => sum + r.count, 0);
    const recentForm = recentTotal > 0 ? ((recentWins / recentTotal) * 100).toFixed(1) : 0;

    return successResponse({
      stats: stats || {},
      level: level || {},
      achievements_unlocked: achievementsCount?.count || 0,
      recent_form: {
        wins: recentWins,
        total: recentTotal,
        percentage: recentForm
      }
    }, 'User stats fetched successfully');

  } catch (error) {
    console.error('Error fetching user stats:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return errorResponse(`Failed to fetch stats: ${error.message}`, 500);
  }
}

// ============================================================================
// GET LEADERBOARD
// ============================================================================

export async function handleGetLeaderboard(request, env) {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'all_time';
    const limit = parseInt(url.searchParams.get('limit')) || 100;

    // Use the pre-made view for all-time leaderboard
    if (period === 'all_time') {
      const leaderboard = await env.DB.prepare(`
        SELECT * FROM v_leaderboard_all_time LIMIT ?
      `).bind(limit).all();

      return successResponse({
        leaderboard: leaderboard.results,
        period: 'all_time'
      });
    }

    // For other periods, query directly
    let dateFilter = '';
    if (period === 'daily') {
      dateFilter = "AND DATE(up.placed_at) = DATE('now')";
    } else if (period === 'weekly') {
      dateFilter = "AND DATE(up.placed_at) >= DATE('now', '-7 days')";
    } else if (period === 'monthly') {
      dateFilter = "AND DATE(up.placed_at) >= DATE('now', '-30 days')";
    }

    const leaderboard = await env.DB.prepare(`
      SELECT 
        ROW_NUMBER() OVER (ORDER BY 
          SUM(CASE WHEN up.status = 'won' THEN up.actual_return - up.stake_amount ELSE -up.stake_amount END) DESC
        ) as rank,
        u.id,
        u.username,
        u.full_name,
        ul.current_level,
        COUNT(up.id) as total_picks,
        SUM(CASE WHEN up.status = 'won' THEN 1 ELSE 0 END) as won_picks,
        CAST(SUM(CASE WHEN up.status = 'won' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(up.id) * 100 as win_rate,
        SUM(CASE WHEN up.status = 'won' THEN up.actual_return - up.stake_amount ELSE -up.stake_amount END) as net_profit,
        (SUM(CASE WHEN up.status = 'won' THEN up.actual_return - up.stake_amount ELSE -up.stake_amount END) / SUM(up.stake_amount)) * 100 as roi_percentage
      FROM users u
      JOIN user_picks up ON u.id = up.user_id
      JOIN user_levels ul ON u.id = ul.user_id
      WHERE up.status IN ('won', 'lost') ${dateFilter}
      GROUP BY u.id
      HAVING COUNT(up.id) >= 5
      ORDER BY net_profit DESC, roi_percentage DESC
      LIMIT ?
    `).bind(limit).all();

    return successResponse({
      leaderboard: leaderboard.results,
      period: period
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return errorResponse('Failed to fetch leaderboard', 500);
  }
}

// ============================================================================
// GET USER ACHIEVEMENTS
// ============================================================================

export async function handleGetUserAchievements(request, env, user) {
  try {
    // Get all achievements with user progress
    const achievements = await env.DB.prepare(`
      SELECT 
        a.*,
        ua.unlocked_at,
        ua.progress,
        ua.is_completed
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
      WHERE a.is_active = 1
      ORDER BY 
        ua.is_completed DESC,
        a.rarity DESC,
        a.xp_reward DESC
    `).bind(user.id).all();

    // Calculate current progress for incomplete achievements
    const stats = await env.DB.prepare(
      'SELECT * FROM user_betting_stats WHERE user_id = ?'
    ).bind(user.id).first();

    const achievementsWithProgress = achievements.results.map(achievement => {
      let currentProgress = achievement.progress || 0;
      
      if (!achievement.is_completed && stats) {
        // Calculate real-time progress based on unlock condition
        switch (achievement.unlock_condition) {
          case 'total_picks':
            currentProgress = stats.total_picks;
            break;
          case 'won_picks':
            currentProgress = stats.won_picks;
            break;
          case 'current_win_streak':
            currentProgress = stats.current_win_streak;
            break;
          case 'net_profit':
            currentProgress = stats.net_profit;
            break;
          case 'win_rate_threshold':
            currentProgress = stats.win_rate >= achievement.threshold_value && stats.settled_picks >= 20 ? 100 : 0;
            break;
          case 'roi_threshold':
            currentProgress = stats.roi_percentage >= achievement.threshold_value && stats.settled_picks >= 50 ? 100 : 0;
            break;
          default:
            currentProgress = achievement.progress || 0;
        }
      }

      return {
        ...achievement,
        current_progress: currentProgress,
        progress_percentage: achievement.threshold_value > 0 
          ? Math.min((currentProgress / achievement.threshold_value) * 100, 100)
          : (achievement.is_completed ? 100 : 0)
      };
    });

    const unlockedCount = achievementsWithProgress.filter(a => a.is_completed).length;
    const totalCount = achievementsWithProgress.length;

    return successResponse({
      achievements: achievementsWithProgress,
      summary: {
        unlocked: unlockedCount,
        total: totalCount,
        completion_percentage: ((unlockedCount / totalCount) * 100).toFixed(1)
      }
    });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return errorResponse('Failed to fetch achievements', 500);
  }
}

// ============================================================================
// GET BANKROLL HISTORY
// ============================================================================

export async function handleGetBankrollHistory(request, env, user) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    const history = await env.DB.prepare(`
      SELECT 
        bh.*,
        up.predicted_outcome,
        up.status as pick_status
      FROM bankroll_history bh
      LEFT JOIN user_picks up ON bh.related_pick_id = up.id
      WHERE bh.user_id = ?
      ORDER BY bh.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(user.id, limit, offset).all();

    const { total } = await env.DB.prepare(
      'SELECT COUNT(*) as total FROM bankroll_history WHERE user_id = ?'
    ).bind(user.id).first();

    return successResponse({
      history: history.results,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + history.results.length < total
      }
    });

  } catch (error) {
    console.error('Error fetching bankroll history:', error);
    return errorResponse('Failed to fetch bankroll history', 500);
  }
}

// ============================================================================
// HELPER: CHECK AND UNLOCK ACHIEVEMENTS
// ============================================================================

async function checkAndUnlockAchievements(env, userId) {
  try {
    // Get user stats
    const stats = await env.DB.prepare(
      'SELECT * FROM user_betting_stats WHERE user_id = ?'
    ).bind(userId).first();

    if (!stats) return;

    // Get all achievements user hasn't completed
    const pendingAchievements = await env.DB.prepare(`
      SELECT a.* 
      FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
      WHERE a.is_active = 1 AND (ua.is_completed IS NULL OR ua.is_completed = 0)
    `).bind(userId).all();

    for (const achievement of pendingAchievements.results) {
      let shouldUnlock = false;
      let progress = 0;

      // Check unlock conditions
      switch (achievement.unlock_condition) {
        case 'total_picks':
          progress = stats.total_picks;
          shouldUnlock = stats.total_picks >= achievement.threshold_value;
          break;
        case 'won_picks':
          progress = stats.won_picks;
          shouldUnlock = stats.won_picks >= achievement.threshold_value;
          break;
        case 'current_win_streak':
          progress = stats.current_win_streak;
          shouldUnlock = stats.current_win_streak >= achievement.threshold_value;
          break;
        case 'net_profit':
          progress = stats.net_profit;
          shouldUnlock = stats.net_profit >= achievement.threshold_value;
          break;
        case 'win_rate_threshold':
          shouldUnlock = stats.win_rate >= achievement.threshold_value && stats.settled_picks >= 20;
          progress = shouldUnlock ? 100 : 0;
          break;
        case 'roi_threshold':
          shouldUnlock = stats.roi_percentage >= achievement.threshold_value && stats.settled_picks >= 50;
          progress = shouldUnlock ? 100 : 0;
          break;
        case 'high_confidence_wins':
          progress = stats.high_confidence_wins;
          shouldUnlock = stats.high_confidence_wins >= achievement.threshold_value;
          break;
        case 'account_age':
          shouldUnlock = true; // Always unlock for early adopter
          progress = 1;
          break;
      }

      // Unlock or update progress
      if (shouldUnlock) {
        await env.DB.prepare(`
          INSERT OR REPLACE INTO user_achievements (user_id, achievement_id, is_completed, progress)
          VALUES (?, ?, 1, ?)
        `).bind(userId, achievement.id, progress).run();

        // Award XP
        await awardXP(env, userId, achievement.xp_reward, `achievement_${achievement.code}`, achievement.id, `Unlocked: ${achievement.name}`);
      } else {
        // Update progress
        await env.DB.prepare(`
          INSERT OR REPLACE INTO user_achievements (user_id, achievement_id, is_completed, progress)
          VALUES (?, ?, 0, ?)
        `).bind(userId, achievement.id, progress).run();
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

// ============================================================================
// HELPER: AWARD XP
// ============================================================================

async function awardXP(env, userId, amount, source, sourceId, description) {
  try {
    // Log XP transaction
    await env.DB.prepare(`
      INSERT INTO xp_transactions (user_id, amount, source, source_id, description)
      VALUES (?, ?, ?, ?, ?)
    `).bind(userId, amount, source, sourceId, description).run();

    // Get current level info
    const level = await env.DB.prepare(
      'SELECT * FROM user_levels WHERE user_id = ?'
    ).bind(userId).first();

    if (!level) return;

    const newTotalXP = level.total_xp + amount;
    const newCurrentXP = level.current_xp + amount;
    let newLevel = level.current_level;
    let remainingXP = newCurrentXP;
    let levelUpCount = level.level_up_count;

    // Calculate XP needed for next level (exponential growth)
    const calculateXPForLevel = (lvl) => Math.floor(100 * Math.pow(1.5, lvl - 1));

    // Check for level ups
    let nextLevelXP = calculateXPForLevel(newLevel + 1);
    while (remainingXP >= nextLevelXP) {
      remainingXP -= nextLevelXP;
      newLevel++;
      levelUpCount++;
      nextLevelXP = calculateXPForLevel(newLevel + 1);
    }

    // Update user level
    await env.DB.prepare(`
      UPDATE user_levels 
      SET current_level = ?, current_xp = ?, total_xp = ?, next_level_xp = ?, level_up_count = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).bind(newLevel, remainingXP, newTotalXP, nextLevelXP, levelUpCount, userId).run();

  } catch (error) {
    console.error('Error awarding XP:', error);
  }
}

// ============================================================================
// ADMIN: SETTLE PICKS (Match results verification)
// ============================================================================

export async function handleSettlePicks(request, env) {
  try {
    const { match_id } = await request.json();

    if (!match_id) {
      return errorResponse('Match ID is required', 400);
    }

    // Get match and prediction
    const prediction = await env.DB.prepare(`
      SELECT * FROM ai_predictions 
      WHERE match_id = ? AND is_finished = 1
    `).bind(match_id).first();

    if (!prediction) {
      return errorResponse('Match not finished or prediction not found', 404);
    }

    // Determine actual outcome
    let actualOutcome;
    if (prediction.home_score > prediction.away_score) {
      actualOutcome = 'home';
    } else if (prediction.away_score > prediction.home_score) {
      actualOutcome = 'away';
    } else {
      actualOutcome = 'draw';
    }

    // Get all pending picks for this match
    const picks = await env.DB.prepare(`
      SELECT * FROM user_picks 
      WHERE match_id = ? AND status = 'pending'
    `).bind(match_id).all();

    let settledCount = 0;
    for (const pick of picks.results) {
      const won = pick.predicted_outcome === actualOutcome;
      const actualReturn = won ? pick.potential_return : 0;
      const newStatus = won ? 'won' : 'lost';

      await env.DB.prepare(`
        UPDATE user_picks 
        SET status = ?, actual_outcome = ?, actual_return = ?, settled_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(newStatus, actualOutcome, actualReturn, pick.id).run();

      // Award XP for settled picks
      if (won) {
        await awardXP(env, pick.user_id, 20, 'pick_won', pick.id, 'Pick won');
      }

      settledCount++;
    }

    return successResponse({
      message: `Settled ${settledCount} picks for match ${match_id}`,
      actual_outcome: actualOutcome,
      settled_count: settledCount
    });

  } catch (error) {
    console.error('Error settling picks:', error);
    return errorResponse('Failed to settle picks', 500);
  }
}

