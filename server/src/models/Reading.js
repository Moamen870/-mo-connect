const mongoose = require('mongoose');

const ReadingSchema = new mongoose.Schema({
    is_connected: {
        type: Boolean,
        required: true
    },
    latency_ms: {
        type: Number,
        required: true
    },
    network_stats: {
        bytes_sent: Number,
        bytes_recv: Number
    },
    failover: {
        is_using_backup: Boolean,
        failure_count: Number,
        active_connections: [String]
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { collection: 'readings' });

const Reading = mongoose.model('Reading', ReadingSchema);

module.exports = Reading;