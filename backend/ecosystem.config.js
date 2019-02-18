module.exports = {
    apps: [{
      name: 'final-year-project',
      script: './src/server.js'
    }],
    deploy: {
      production: {
        user: 'ubuntu',
        host: 'ec2-35-178-20-32.eu-west-2.compute.amazonaws.com',
        key: '~/.ssh/final-year-project.pem',
        ref: 'origin/dev',
        repo: 'git@github.com:WillCooter/final-year-project.git',
        path: '/home/ubuntu/final-year-project',
        'post-deploy': 'npm install && pm2 startOrRestart ecosystem.config.js'
      }
    }
  }

// OR => ref: 'origin/master'