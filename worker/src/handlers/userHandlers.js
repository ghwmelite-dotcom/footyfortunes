/**
 * User Profile and Settings Handlers
 * Handles user profile updates, settings management, and preferences
 */

import { successResponse, errorResponse } from '../utils/response.js';
import bcrypt from 'bcryptjs';

// ============================================================================
// UPDATE USER PROFILE
// ============================================================================

export async function handleUpdateProfile(request, env, user) {
  try {
    const { username, email, avatar, bio } = await request.json();

    // Validation
    if (username && username.length < 3) {
      return errorResponse('Username must be at least 3 characters', 400);
    }

    if (email && !email.includes('@')) {
      return errorResponse('Invalid email format', 400);
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await env.DB.prepare(
        'SELECT id FROM users WHERE email = ? AND id != ?'
      ).bind(email, user.id).first();

      if (existingUser) {
        return errorResponse('Email is already in use', 409);
      }
    }

    // Check if username is already taken
    if (username && username !== user.username) {
      const existingUser = await env.DB.prepare(
        'SELECT id FROM users WHERE username = ? AND id != ?'
      ).bind(username, user.id).first();

      if (existingUser) {
        return errorResponse('Username is already taken', 409);
      }
    }

    // Update user profile
    const updates = [];
    const values = [];

    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(avatar);
    }

    // Update user table
    if (updates.length > 0) {
      values.push(user.id);
      await env.DB.prepare(`
        UPDATE users
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(...values).run();
    }

    // Update or create user profile
    const existingProfile = await env.DB.prepare(
      'SELECT id FROM user_profiles WHERE user_id = ?'
    ).bind(user.id).first();

    if (bio !== undefined) {
      if (existingProfile) {
        await env.DB.prepare(`
          UPDATE user_profiles
          SET bio = ?, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ?
        `).bind(bio, user.id).run();
      } else {
        await env.DB.prepare(`
          INSERT INTO user_profiles (user_id, bio)
          VALUES (?, ?)
        `).bind(user.id, bio).run();
      }
    }

    // Fetch updated user data
    const updatedUser = await env.DB.prepare(`
      SELECT u.*, up.bio, up.avatar as profile_avatar
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ?
    `).bind(user.id).first();

    return successResponse({
      user: updatedUser
    }, 'Profile updated successfully');

  } catch (error) {
    console.error('Error updating profile:', error);
    return errorResponse('Failed to update profile', 500);
  }
}

// ============================================================================
// UPDATE USER SETTINGS
// ============================================================================

export async function handleUpdateSettings(request, env, user) {
  try {
    const settings = await request.json();
    console.log('Settings update request:', settings);
    console.log('User ID:', user.id);

    // Get existing settings (user_id is the primary key, no separate id column)
    const existingSettings = await env.DB.prepare(
      'SELECT user_id FROM user_settings WHERE user_id = ?'
    ).bind(user.id).first();

    console.log('Existing settings found:', !!existingSettings);

    if (existingSettings) {
      // Update existing settings
      await env.DB.prepare(`
        UPDATE user_settings
        SET email_notifications = ?,
            push_notifications = ?,
            match_updates = ?,
            prediction_alerts = ?,
            achievement_alerts = ?,
            marketing_emails = ?,
            theme = ?,
            language = ?,
            timezone = ?,
            currency = ?,
            default_stake = ?,
            risk_tolerance = ?,
            favorite_leagues = ?,
            updated_at = ?
        WHERE user_id = ?
      `).bind(
        settings.emailNotifications ?? true,
        settings.pushNotifications ?? true,
        settings.matchUpdates ?? true,
        settings.predictionAlerts ?? true,
        settings.achievementAlerts ?? true,
        settings.marketingEmails ?? false,
        settings.theme || 'dark',
        settings.language || 'en',
        settings.timezone || 'UTC',
        settings.currency || 'GHS',
        settings.defaultStake || 100,
        settings.riskTolerance || 'medium',
        JSON.stringify(settings.favoriteLeagues || []),
        new Date().toISOString(),
        user.id
      ).run();
    } else {
      // Insert new settings
      await env.DB.prepare(`
        INSERT INTO user_settings (
          user_id, email_notifications, push_notifications,
          match_updates, prediction_alerts, achievement_alerts,
          marketing_emails, theme, language, timezone, currency,
          default_stake, risk_tolerance, favorite_leagues
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user.id,
        settings.emailNotifications ?? true,
        settings.pushNotifications ?? true,
        settings.matchUpdates ?? true,
        settings.predictionAlerts ?? true,
        settings.achievementAlerts ?? true,
        settings.marketingEmails ?? false,
        settings.theme || 'dark',
        settings.language || 'en',
        settings.timezone || 'UTC',
        settings.currency || 'GHS',
        settings.defaultStake || 100,
        settings.riskTolerance || 'medium',
        JSON.stringify(settings.favoriteLeagues || [])
      ).run();
    }

    console.log('Settings updated successfully for user:', user.id);

    return successResponse({
      message: 'Settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return errorResponse(`Failed to update settings: ${error.message}`, 500);
  }
}

// ============================================================================
// GET USER SETTINGS
// ============================================================================

export async function handleGetSettings(request, env, user) {
  try {
    const settings = await env.DB.prepare(`
      SELECT * FROM user_settings WHERE user_id = ?
    `).bind(user.id).first();

    if (!settings) {
      // Return default settings if none exist
      return successResponse({
        settings: {
          emailNotifications: true,
          pushNotifications: true,
          matchUpdates: true,
          predictionAlerts: true,
          achievementAlerts: true,
          marketingEmails: false,
          theme: 'dark',
          language: 'en',
          timezone: 'UTC',
          currency: 'GHS',
          defaultStake: 100,
          riskTolerance: 'medium',
          favoriteLeagues: []
        }
      });
    }

    return successResponse({
      settings: {
        emailNotifications: settings.email_notifications,
        pushNotifications: settings.push_notifications,
        matchUpdates: settings.match_updates,
        predictionAlerts: settings.prediction_alerts,
        achievementAlerts: settings.achievement_alerts,
        marketingEmails: settings.marketing_emails,
        theme: settings.theme,
        language: settings.language,
        timezone: settings.timezone,
        currency: settings.currency,
        defaultStake: settings.default_stake,
        riskTolerance: settings.risk_tolerance,
        favoriteLeagues: JSON.parse(settings.favorite_leagues || '[]')
      }
    });

  } catch (error) {
    console.error('Error getting settings:', error);
    return errorResponse('Failed to get settings', 500);
  }
}

// ============================================================================
// CHANGE PASSWORD
// ============================================================================

export async function handleChangePassword(request, env, user) {
  try {
    const { currentPassword, newPassword } = await request.json();

    // Validation
    if (!currentPassword || !newPassword) {
      return errorResponse('Current password and new password are required', 400);
    }

    if (newPassword.length < 8) {
      return errorResponse('New password must be at least 8 characters', 400);
    }

    // Verify current password
    const dbUser = await env.DB.prepare(
      'SELECT password_hash FROM users WHERE id = ?'
    ).bind(user.id).first();

    const isValidPassword = await bcrypt.compare(currentPassword, dbUser.password_hash);

    if (!isValidPassword) {
      return errorResponse('Current password is incorrect', 401);
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await env.DB.prepare(`
      UPDATE users
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(newPasswordHash, user.id).run();

    return successResponse({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    return errorResponse('Failed to change password', 500);
  }
}
