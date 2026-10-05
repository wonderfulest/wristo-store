/** Reward reporting must not prevent the Garmin download navigation. */
export async function recordDownloadReward(appId: number, token: string): Promise<{ credits: number; outcome: string }> {
  const response = await fetch('/api/user/studio-credits/tasks/download', {
    method: 'POST', credentials: 'include', keepalive: true,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ appId }),
  })
  const result = await response.json()
  if (!response.ok || result.code !== 0 || !result.data) throw new Error('Reward could not be confirmed')
  return result.data
}
