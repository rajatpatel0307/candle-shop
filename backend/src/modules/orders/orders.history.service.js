export function summarizeHistory(history = []) {
  return history.map((item) => ({ from: item.OldStatus, to: item.NewStatus, at: item.ChangedAtUtc, notes: item.Notes }));
}
