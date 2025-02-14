// Team 1 name:
// Team 2 name:
// Team 3 name:
// Team 4 name:
// Team 5 name:
// Team 6 name:
// Team 7 name:
// Team 8 name:
// Team 9 name:
// Team 10 name:
// Team 11 name:
// Team 12 name:
// Team 13 name:
// Team 14 name:
// Team 15 name:
import { Speedrun } from '../../src/common/api/data/Speedrun.js';
import SpeedrunStats from '../../src/speedruns/SpeedrunStats.js';

let speedrunStats: SpeedrunStats;

beforeAll(() => {
    speedrunStats = new SpeedrunStats();
});

describe('@unit SpeedrunStats', () => {
    describe('calculateStandardDeviations', () => {
        test('should return 0 when the list is empty', () => {
            const result = speedrunStats.calculateStandardDeviations([], 1000);
            expect(result).toBe(0);
        });

        test('should return 0 when the standard deviation is 0', () => {
            const result = speedrunStats.calculateStandardDeviations([1000, 1000, 1000], 1000);
            expect(result).toBe(0);
        });

        test('should calculate the correct number of standard deviations for a new entry', () => {
            const result = speedrunStats.calculateStandardDeviations([1000, 2000, 3000], 2000);
            expect(result).toBeCloseTo(0, 1);
        });

        test('should calculate the correct number of standard deviations for a new entry that is above the mean', () => {
            const result = speedrunStats.calculateStandardDeviations([1000, 2000, 3000], 100);
            expect(result).toBeCloseTo(2.32, 1);
        });

        test('should handle a single-element list', () => {
            const result = speedrunStats.calculateStandardDeviations([1000], 500);
            expect(result).toBeCloseTo(0, 1);
        });
    });

    describe('isUnreasonableWorldRecord', () => {
        test('should return false when the new entry is within the standard deviation limit', () => {
            const speedRuns = [{ time_ms: 1000 }, { time_ms: 1100 }, { time_ms: 1200 }] as Speedrun[];
            const newSpeedrunCandidate = { time_ms: 1150 } as Speedrun;
            const result = speedrunStats.isUnreasonableWorldRecord(speedRuns, newSpeedrunCandidate, 2);
            expect(result.isUnreasonable).toBe(false);
        });

        test('should return true when the new entry is beyond the standard deviation limit', () => {
            const speedRuns = [{ time_ms: 1000 }, { time_ms: 1100 }, { time_ms: 1200 }] as Speedrun[];
            const newSpeedrunCandidate = { time_ms: 500 } as Speedrun;
            const result = speedrunStats.isUnreasonableWorldRecord(speedRuns, newSpeedrunCandidate, 2);
            expect(result.isUnreasonable).toBe(true);
        });

        test('should return false when the list is empty', () => {
            const speedRuns: Speedrun[] = [];
            const newSpeedrunCandidate = { time_ms: 1000 } as Speedrun;
            const result = speedrunStats.isUnreasonableWorldRecord(speedRuns, newSpeedrunCandidate, 2);
            expect(result.isUnreasonable).toBe(false);
        });

        test('should handle a single-element list', () => {
            const speedRuns = [{ time_ms: 1000 }] as Speedrun[];
            const newSpeedrunCandidate = { time_ms: 1000 } as Speedrun;
            const result = speedrunStats.isUnreasonableWorldRecord(speedRuns, newSpeedrunCandidate, 2);
            expect(result.isUnreasonable).toBe(false);
        });
    });

    describe('isUnreasonablePersonalBest', () => {
        test('should return false when the new entry is within the standard deviation limit for the same runner', () => {
            const speedRuns = [
                { runner: { id: 'runner1' }, time_ms: 1000 },
                { runner: { id: 'runner1' }, time_ms: 1100 },
                { runner: { id: 'runner1' }, time_ms: 1200 },
            ] as Speedrun[];
            const newSpeedrunCandidate = { runner: { id: 'runner1' }, time_ms: 1150 } as Speedrun;
            const result = speedrunStats.isUnreasonablePersonalBest(speedRuns, newSpeedrunCandidate, 2);
            expect(result.isUnreasonable).toBe(false);
        });

        test('should return true when the new entry is beyond the standard deviation limit for the same runner', () => {
            const speedRuns = [
                { runner: { id: 'runner1' }, time_ms: 1000 },
                { runner: { id: 'runner1' }, time_ms: 1100 },
                { runner: { id: 'runner1' }, time_ms: 1200 },
            ] as Speedrun[];
            const newSpeedrunCandidate = { runner: { id: 'runner1' }, time_ms: 500 } as Speedrun;
            const result = speedrunStats.isUnreasonablePersonalBest(speedRuns, newSpeedrunCandidate, 2);
            expect(result.isUnreasonable).toBe(true);
        });

        test('should return false when there are no previous runs for the runner', () => {
            const speedRuns = [
                { runner: { id: 'runner2' }, time_ms: 1000 },
                { runner: { id: 'runner2' }, time_ms: 1100 },
            ] as Speedrun[];
            const newSpeedrunCandidate = { runner: { id: 'runner1' }, time_ms: 1000 } as Speedrun;
            const result = speedrunStats.isUnreasonablePersonalBest(speedRuns, newSpeedrunCandidate, 2);
            expect(result.isUnreasonable).toBe(false);
        });

        test('should handle a single-element list for the same runner', () => {
            const speedRuns = [{ runner: { id: 'runner1' }, time_ms: 1000 }] as Speedrun[];
            const newSpeedrunCandidate = { runner: { id: 'runner1' }, time_ms: 1000 } as Speedrun;
            const result = speedrunStats.isUnreasonablePersonalBest(speedRuns, newSpeedrunCandidate, 2);
            expect(result.isUnreasonable).toBe(false);
        });
    });
});
