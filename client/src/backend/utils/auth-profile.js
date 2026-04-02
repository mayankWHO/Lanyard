import { supabase } from '../config/supabase.js';
import { PROJECT_ROLES, normalizeRole } from './rbac.js';

function buildFallbackFullName(user) {
    const fullName = user?.user_metadata?.full_name;
    if (typeof fullName === 'string' && fullName.trim()) {
        return fullName.trim();
    }

    const email = user?.email;
    if (typeof email === 'string' && email.includes('@')) {
        return email.split('@')[0];
    }

    return null;
}

export async function ensureUserProfile(user) {
    if (!user?.id) {
        return null;
    }

    const { data: existingProfile, error: selectError } = await supabase
        .from('user_profiles')
        .select('user_id, role, full_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

    if (selectError) {
        throw selectError;
    }

    if (existingProfile) {
        return {
            ...existingProfile,
            role: normalizeRole(existingProfile.role),
        };
    }

    const payload = {
        user_id: user.id,
        full_name: buildFallbackFullName(user),
        avatar_url: typeof user?.user_metadata?.avatar_url === 'string'
            ? user.user_metadata.avatar_url
            : null,
        role: PROJECT_ROLES.MEMBER,
    };

    const { data: createdProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert(payload)
        .select('user_id, role, full_name, avatar_url')
        .single();

    if (insertError) {
        throw insertError;
    }

    return {
        ...createdProfile,
        role: normalizeRole(createdProfile.role),
    };
}
