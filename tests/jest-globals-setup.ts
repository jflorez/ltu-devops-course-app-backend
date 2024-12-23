/* eslint-disable @typescript-eslint/no-unused-vars */
import { DockerComposeEnvironment, Wait } from 'testcontainers';
import { Config } from '@jest/types';
import 'dotenv/config';
import chalk from 'chalk';
import { existsSync } from 'fs';

export default async function setup(globalConfig: Config.GlobalConfig, projectConfig: Config.ProjectConfig) {
    if (!globalConfig.testNamePattern || globalConfig.testNamePattern?.includes('@api') || globalConfig.testNamePattern !== '@unit') {
        if (existsSync('./docker-compose.yml')) {
            console.log(`${chalk.bgCyan.bold('\n DOCKER COMPOSE ')} ${chalk.blue('Setting up docker compose environment')}`);
            const environment = await new DockerComposeEnvironment('.', 'docker-compose.yml')
                .withWaitStrategy('speedrun-db', Wait.forHealthCheck())
                .withEnvironment({
                    MARIADB_ROOT_PASSWORD: process.env.MARIADB_ROOT_PASSWORD!,
                    MARIADB_PASSWORD: process.env.MARIADB_PASSWORD!,
                    MARIADB_DATABASE: process.env.MARIADB_DATABASE!,
                    MARIADB_HOST: process.env.MARIADB_HOST!,
                    MARIADB_USER: process.env.MARIADB_USER!,
                    MARIADB_PORT: process.env.MARIADB_PORT!,
                })
                .up(['speedrun-db']);
            console.log(`${chalk.bgCyan.bold(' DOCKER COMPOSE ')} ${chalk.blue('Docker compose environment setup')}`);
            (globalThis as any).dbComposeEnvironment = environment;
        } else {
            console.log(`${chalk.bgYellow.bold('\n WARNING ')} ${chalk.yellow('docker-compose.yml not found. Please ensure the database is running for integration tests to work properly.')}`);
        }
    }
}
