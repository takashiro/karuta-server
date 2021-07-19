/**
 * Idle for a few milliseconds.
 * @param msecs a few milliseconds
 */
export default function idle(msecs: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, msecs);
	});
}
