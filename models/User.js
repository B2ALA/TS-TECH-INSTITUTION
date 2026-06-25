const supabase = require('../config/db');

const User = {
    async findById(uuid) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', uuid)
            .single();
        if (error) throw error;
        return data;
    },

    async createProfile(uuid, fullName, email, role, status = 'active') {
        const { data, error } = await supabase
            .from('profiles')
            .insert([{ id: uuid, full_name: fullName, email, role, status }])
            .select();
        if (error) throw error;
        return data[0];
    },

    async updateStatus(uuid, newStatus) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', uuid)
            .select();
        if (error) throw error;
        return data[0];
    }
};

module.exports = User;
