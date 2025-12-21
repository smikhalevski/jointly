import { describe, test, expect } from 'vitest';
import { groupTasks } from '../main/startTasks.js';

describe('groupTasks', () => {
  test('groups tasks', () => {
    expect(groupTasks([{ command: 'xxx' }, { command: 'yyy' }])).toEqual([[{ command: 'xxx' }, { command: 'yyy' }]]);
  });

  test('throws if cyclic dependency detected', () => {
    expect(() =>
      groupTasks([
        { key: 'aaa', command: 'xxx', dependencies: ['bbb'] },
        { key: 'bbb', command: 'yyy', dependencies: ['aaa'] },
      ])
    ).toThrow(new Error('Cyclic dependency'));

    expect(() => groupTasks([{ key: 'aaa', command: 'xxx', dependencies: ['aaa'] }])).toThrow(
      new Error('Cyclic dependency')
    );
  });

  test('groups dependent tasks', () => {
    expect(
      groupTasks([
        { key: 'aaa', command: 'aaa' },
        { command: 'bbb', dependencies: ['aaa'] },
      ])
    ).toEqual([[{ key: 'aaa', command: 'aaa' }], [{ command: 'bbb', dependencies: ['aaa'] }]]);

    expect(
      groupTasks([
        { command: 'bbb', dependencies: ['aaa'] },
        { key: 'aaa', command: 'aaa' },
      ])
    ).toEqual([[{ key: 'aaa', command: 'aaa' }], [{ command: 'bbb', dependencies: ['aaa'] }]]);
  });
});
