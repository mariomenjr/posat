
export async function safeGuard(callback: Function): Promise<void> {
  try {
    await callback();
  } catch (error) {
    console.error(`[fatal] ${(error as Error).message}`)
  }
}
