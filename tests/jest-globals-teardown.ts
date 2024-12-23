/* eslint-disable @typescript-eslint/no-unused-vars */
import { Config } from '@jest/types';
import 'dotenv/config';
import chalk from 'chalk';
import { StartedDockerComposeEnvironment } from 'testcontainers';
export default async function teardown(globalConfig: Config.GlobalConfig, projectConfig: Config.ProjectConfig) {
    if ((globalThis as any).dbComposeEnvironment) {
        console.log(
            `${chalk.bgCyan.bold('\n DOCKER COMPOSE ')} ${chalk.blue('Tearing down docker compose environment')}`,
        );
        const environment = (globalThis as any).dbComposeEnvironment as StartedDockerComposeEnvironment;
        await environment.down({ removeVolumes: true });
        console.log(
            `${chalk.bgCyan.bold(' DOCKER COMPOSE ')} ${chalk.blue('Docker compose environment teardown complete')}`,
        );
    }
}
