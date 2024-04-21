import { groupTasks } from '../main';

describe('groupTasks', () => {
  test('groups tasks', () => {
    expect(groupTasks([{ command: 'xxx' }, { command: 'yyy' }])).toEqual([[{ command: 'xxx' }, { command: 'yyy' }]]);
  });

  test('throws if cyclic dependency detected', () => {
    expect(() =>
      groupTasks([
        { id: 'aaa', command: 'xxx', dependencies: ['bbb'] },
        { id: 'bbb', command: 'yyy', dependencies: ['aaa'] },
      ])
    ).toThrow(new Error('Cyclic dependency'));

    expect(() => groupTasks([{ id: 'aaa', command: 'xxx', dependencies: ['aaa'] }])).toThrow(
      new Error('Cyclic dependency')
    );
  });

  test('groups dependent tasks', () => {
    expect(
      groupTasks([
        { id: 'aaa', command: 'aaa' },
        { command: 'bbb', dependencies: ['aaa'] },
      ])
    ).toEqual([[{ id: 'aaa', command: 'aaa' }], [{ command: 'bbb', dependencies: ['aaa'] }]]);

    expect(
      groupTasks([
        { command: 'bbb', dependencies: ['aaa'] },
        { id: 'aaa', command: 'aaa' },
      ])
    ).toEqual([[{ id: 'aaa', command: 'aaa' }], [{ command: 'bbb', dependencies: ['aaa'] }]]);
  });
});
