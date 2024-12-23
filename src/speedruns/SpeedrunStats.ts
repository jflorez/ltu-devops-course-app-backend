import { Speedrun } from '../common/api/data/Speedrun.js';

export interface UnreasonableCheckResult {
    isUnreasonable: boolean;
    standardDeviations: number;
    message: string;
}

export default class SpeedrunStats {
    public isUnreasonableWorldRecord(
        speedRuns: Speedrun[],
        newSpeedrunCandidate: Speedrun,
        maxStandardDeviations = 2,
    ): UnreasonableCheckResult {
        const ascendingList = speedRuns.map(speedrun => speedrun.time_ms).sort((a, b) => a - b);
        const newEntry = newSpeedrunCandidate.time_ms;
        const numStandardDeviations = this.calculateStandardDeviations(ascendingList, newEntry);
        return {
            isUnreasonable: numStandardDeviations > maxStandardDeviations,
            standardDeviations: numStandardDeviations,
            message: 'Speedrun is an unreasonable world record improvement',
        };
    }

    public isUnreasonablePersonalBest(
        speedRuns: Speedrun[],
        newSpeedrunCandidate: Speedrun,
        maxStandardDeviations = 2,
    ): UnreasonableCheckResult {
        const ascendingList = speedRuns
            .filter(speedrun => speedrun.runner.id === newSpeedrunCandidate.runner.id)
            .map(speedrun => speedrun.time_ms)
            .sort((a, b) => a - b);
        const newEntry = newSpeedrunCandidate.time_ms;
        const numStandardDeviations = this.calculateStandardDeviations(ascendingList, newEntry);
        return {
            isUnreasonable: numStandardDeviations > maxStandardDeviations,
            standardDeviations: numStandardDeviations,
            message: 'Speedrun is an unreasonable personal best improvement',
        };
    }

    public calculateStandardDeviations(ascendingList: number[], newEntry: number): number {
        if (ascendingList.length === 0) return 0;

        // Use reduce to calculate the sum of all numbers in ascendingList, then divide by the length to get the mean
        const currentMean = ascendingList.reduce((sum, number) => sum + number, 0) / ascendingList.length;

        // Use reduce to calculate the sum of squared differences from the mean, then divide by the length to get the variance
        const variance =
            ascendingList.reduce((sum, number) => sum + Math.pow(number - currentMean, 2), 0) / ascendingList.length;
        const standardDeviation = Math.sqrt(variance);
        return standardDeviation === 0 ? 0 : (currentMean - newEntry) / standardDeviation;
    }
}
