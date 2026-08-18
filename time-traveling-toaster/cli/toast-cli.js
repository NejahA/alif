#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import axios from 'axios';

const program = new Command();
const API_BASE = 'http://localhost:4000/api';

// ASCII Art
const ASCII_ART = `
${chalk.yellow.bold('  _______ _                 _     _                  _______               _             ')}
${chalk.yellow.bold(' |__   __(_)               | |   | |                |__   __|             | |            ')}
${chalk.yellow.bold('    | |   _ _ __ ___   __ _| |_  | |_ ___  _ __ _   _   | | ___   __ _  __| | ___  ___  ')}
${chalk.yellow.bold("    | |  | | '_ ` _ \\ / _` | __| | __/ _ \\| '__| | | |  | |/ _ \\ / _` |/ _` |/ _ \\/ __|")}
${chalk.yellow.bold('    | |  | | | | | | | (_| | |_  | || (_) | |  | |_| |  | | (_) | (_| | (_| |  __/\\__ \\')}
${chalk.yellow.bold('    |_|  |_|_| |_| |_|\\__,_|\\__|  \\__\\___/|_|   \\__, |  |_|\\___/ \\__,_|\\__,_|\\___||___/')}
${chalk.yellow.bold('                                                 __/ |                                  ')}
${chalk.yellow.bold('                                                |___/                                   ')}

${chalk.cyan.bold('Revolutionary Time Traveling Toaster CLI')}
${chalk.gray('Version 2.0.0 - With ALL Features')}
`;

program
  .name('toast')
  .description('Time Traveling Toaster Command Line Interface')
  .version('2.0.0');

program
  .command('start')
  .description('Start your time traveling journey')
  .action(async () => {
    console.log(ASCII_ART);
    
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          'Login to existing account',
          'Register new account',
          'Check server status',
          'Travel through time',
          'Discover toasters',
          'Check achievements',
          'Exit',
        ],
      },
    ]);
    
    handleAction(answers.action);
  });

program
  .command('status')
  .description('Check server and game status')
  .action(async () => {
    try {
      const response = await axios.get(`${API_BASE}/game/stats`);
      console.log(chalk.green.bold('✓ Server Status: Online'));
      console.log(chalk.cyan('Game:'), response.data.game.name);
      console.log(chalk.cyan('Version:'), response.data.game.version);
      console.log(chalk.cyan('Features:'));
      response.data.game.features.forEach(feature => {
        console.log(chalk.gray('  •'), feature);
      });
      console.log(chalk.cyan('Time Periods:'), response.data.game.timePeriods.join(', '));
    } catch (error) {
      console.log(chalk.red.bold('✗ Server Status: Offline'));
      console.log(chalk.gray('Make sure the backend server is running on http://localhost:4000'));
    }
  });

program
  .command('health')
  .description('Check API health')
  .action(async () => {
    try {
      const response = await axios.get('http://localhost:4000/health');
      console.log(chalk.green.bold('✓ API Health: OK'));
      console.log(chalk.gray('Timestamp:'), response.data.timestamp);
    } catch (error) {
      console.log(chalk.red.bold('✗ API Health: ERROR'));
    }
  });

program
  .command('travel <period>')
  .description('Travel to a specific time period')
  .action(async (period) => {
    const validPeriods = ['prehistoric', 'medieval', 'renaissance', 'industrial', 'modern', 'futuristic'];
    
    if (!validPeriods.includes(period)) {
      console.log(chalk.red.bold(`Invalid time period: ${period}`));
      console.log(chalk.cyan('Valid periods:'), validPeriods.join(', '));
      return;
    }
    
    console.log(chalk.yellow(`🚀 Traveling to ${period} era...`));
    
    // Simulate time travel
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(chalk.green.bold(`✓ Arrived in ${period} era!`));
    console.log(chalk.gray('Energy cost:'), '25');
    console.log(chalk.gray('Remaining energy:'), '75');
    console.log(chalk.cyan('Discovered:'), `Ancient ${period} Toaster`);
  });

program
  .command('discover')
  .description('Discover nearby toasters')
  .action(async () => {
    console.log(chalk.yellow('🔍 Scanning for toasters...'));
    
    // Simulate discovery
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const toasters = [
      { name: 'Ancient Prehistoric Toaster', period: 'prehistoric', distance: '10m' },
      { name: 'Medieval Castle Toaster', period: 'medieval', distance: '25m' },
      { name: 'Renaissance Art Toaster', period: 'renaissance', distance: '50m' },
    ];
    
    console.log(chalk.green.bold(`✓ Found ${toasters.length} toasters:`));
    
    toasters.forEach((toaster, index) => {
      console.log(chalk.cyan(`  ${index + 1}. ${toaster.name}`));
      console.log(chalk.gray(`     Period: ${toaster.period}, Distance: ${toaster.distance}`));
    });
  });

program
  .command('toast')
  .description('Make some toast!')
  .action(async () => {
    console.log(chalk.yellow('🍞 Preparing toast...'));
    
    // Simulate toasting
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(chalk.green.bold('✓ Toast is ready!'));
    console.log(chalk.gray('Energy used:'), '10');
    console.log(chalk.gray('Toasts collected:'), '5');
    console.log(chalk.cyan('Special effect:'), 'golden_crust');
    console.log(chalk.magenta('Achievement unlocked:'), 'First Toast');
  });

async function handleAction(action) {
  let token = null; // Normally stored in a config file, keeping it simple for CLI scope
  
  switch (action) {
    case 'Login to existing account':
      try {
        const credentials = await inquirer.prompt([
          { type: 'input', name: 'email', message: 'Email:' },
          { type: 'password', name: 'password', message: 'Password:' }
        ]);
        const res = await axios.post(`${API_BASE}/auth/login`, credentials);
        console.log(chalk.green.bold('✓ Login successful!'));
        console.log(chalk.cyan(`Welcome back, ${res.data.user.username}!`));
        token = res.data.tokens.accessToken;
      } catch (err) {
        console.log(chalk.red.bold('✗ Login failed:'), err.response?.data?.error || err.message);
      }
      break;
    case 'Register new account':
      try {
        const regData = await inquirer.prompt([
          { type: 'input', name: 'username', message: 'Username:' },
          { type: 'input', name: 'email', message: 'Email:' },
          { type: 'password', name: 'password', message: 'Password:' },
          { type: 'password', name: 'confirmPassword', message: 'Confirm Password:' }
        ]);
        const res = await axios.post(`${API_BASE}/auth/register`, regData);
        console.log(chalk.green.bold('✓ Registration successful!'));
        console.log(chalk.cyan(`Welcome to the Time Traveling Toaster, ${res.data.user.username}!`));
        token = res.data.tokens.accessToken;
      } catch (err) {
        console.log(chalk.red.bold('✗ Registration failed:'), err.response?.data?.error || err.message);
      }
      break;
    case 'Check server status':
      await program.parseAsync(['', '', 'status']);
      break;
    case 'Travel through time':
      const { period } = await inquirer.prompt([
        {
          type: 'list',
          name: 'period',
          message: 'Choose a time period:',
          choices: ['prehistoric', 'medieval', 'renaissance', 'industrial', 'modern', 'futuristic'],
        },
      ]);
      await program.parseAsync(['', '', 'travel', period]);
      break;
    case 'Discover toasters':
      await program.parseAsync(['', '', 'discover']);
      break;
    case 'Check achievements':
      console.log(chalk.yellow('🏆 Fetching achievements...'));
      try {
        // Without auth we can just show a mock or a real one if logged in
        if (!token) {
          console.log(chalk.cyan('You must be logged in to view your achievements.'));
        } else {
          const res = await axios.get(`${API_BASE}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log(chalk.green.bold(`✓ Achievements for ${res.data.user.username}:`));
          if (res.data.user.achievements && res.data.user.achievements.length > 0) {
            res.data.user.achievements.forEach(ach => {
              console.log(chalk.magenta(`  • ${ach.name}: ${ach.description} (${ach.points} pts)`));
            });
          } else {
            console.log(chalk.gray('  No achievements yet. Keep traveling!'));
          }
        }
      } catch (err) {
        console.log(chalk.red.bold('✗ Failed to load achievements:'), err.response?.data?.error || err.message);
      }
      break;
    case 'Exit':
      console.log(chalk.gray('Goodbye! Safe travels through time!'));
      process.exit(0);
  }
}

program.parse(process.argv);