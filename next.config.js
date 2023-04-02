// next.config.js
const path = require('path');

const withPWA = require('next-pwa')({
    dest: 'public'
})

module.exports = withPWA({
    compiler: {
        styledComponents: true,
    },
    webpack: (config) => {
        config.resolve.modules.push(path.resolve('./'));
        return config;
    }
});