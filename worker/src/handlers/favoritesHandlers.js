/**
 * Favorites Handlers
 * Handles saving and managing favorite predictions
 */

import { successResponse, errorResponse } from '../utils/response.js';

// ============================================================================
// ADD TO FAVORITES
// ============================================================================

export async function handleAddFavorite(request, env, user) {
  try {
    const url = new URL(request.url);
    const predictionId = url.pathname.split('/').pop();

    if (!predictionId || isNaN(Number(predictionId))) {
      return errorResponse('Invalid prediction ID', 400);
    }

    // Check if prediction exists
    const prediction = await env.DB.prepare(
      'SELECT id FROM ai_predictions WHERE id = ?'
    ).bind(predictionId).first();

    if (!prediction) {
      return errorResponse('Prediction not found', 404);
    }

    // Check if already favorited
    const existing = await env.DB.prepare(
      'SELECT id FROM user_favorites WHERE user_id = ? AND prediction_id = ?'
    ).bind(user.id, predictionId).first();

    if (existing) {
      return errorResponse('Prediction already in favorites', 409);
    }

    // Add to favorites
    await env.DB.prepare(`
      INSERT INTO user_favorites (user_id, prediction_id)
      VALUES (?, ?)
    `).bind(user.id, predictionId).run();

    return successResponse({
      message: 'Added to favorites'
    });

  } catch (error) {
    console.error('Error adding favorite:', error);
    return errorResponse('Failed to add favorite', 500);
  }
}

// ============================================================================
// REMOVE FROM FAVORITES
// ============================================================================

export async function handleRemoveFavorite(request, env, user) {
  try {
    const url = new URL(request.url);
    const predictionId = url.pathname.split('/').pop();

    if (!predictionId || isNaN(Number(predictionId))) {
      return errorResponse('Invalid prediction ID', 400);
    }

    // Remove from favorites
    const result = await env.DB.prepare(`
      DELETE FROM user_favorites
      WHERE user_id = ? AND prediction_id = ?
    `).bind(user.id, predictionId).run();

    if (result.meta.changes === 0) {
      return errorResponse('Favorite not found', 404);
    }

    return successResponse({
      message: 'Removed from favorites'
    });

  } catch (error) {
    console.error('Error removing favorite:', error);
    return errorResponse('Failed to remove favorite', 500);
  }
}

// ============================================================================
// GET USER FAVORITES
// ============================================================================

export async function handleGetFavorites(request, env, user) {
  try {
    const favorites = await env.DB.prepare(`
      SELECT
        ap.*,
        ht.name as home_team_name,
        ht.logo as home_team_logo,
        at.name as away_team_name,
        at.logo as away_team_logo,
        l.name as league_name,
        l.logo as league_logo,
        l.country as league_country,
        m.match_time,
        m.status as match_status,
        m.home_score,
        m.away_score,
        uf.created_at as favorited_at
      FROM user_favorites uf
      JOIN ai_predictions ap ON uf.prediction_id = ap.id
      JOIN matches m ON ap.match_id = m.id
      JOIN leagues l ON m.league_id = l.id
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      WHERE uf.user_id = ?
      ORDER BY uf.created_at DESC
      LIMIT 100
    `).bind(user.id).all();

    return successResponse({
      favorites: favorites.results || [],
      count: favorites.results?.length || 0
    });

  } catch (error) {
    console.error('Error getting favorites:', error);
    return errorResponse('Failed to get favorites', 500);
  }
}

// ============================================================================
// CHECK IF FAVORITED
// ============================================================================

export async function handleCheckFavorite(request, env, user) {
  try {
    const url = new URL(request.url);
    const predictionId = url.pathname.split('/').pop();

    if (!predictionId || isNaN(Number(predictionId))) {
      return errorResponse('Invalid prediction ID', 400);
    }

    const favorite = await env.DB.prepare(
      'SELECT id FROM user_favorites WHERE user_id = ? AND prediction_id = ?'
    ).bind(user.id, predictionId).first();

    return successResponse({
      isFavorited: !!favorite
    });

  } catch (error) {
    console.error('Error checking favorite:', error);
    return errorResponse('Failed to check favorite', 500);
  }
}
