module.exports = {
    devServer: {
        proxy: {
            '/api': {
                target: 'http://199.255.99.141:8000',
                ws: true,
                changeOrigin: true
            }
        }
    }
}