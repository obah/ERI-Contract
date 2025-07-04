export function getEvents(
  contract: any,
  receipt: { logs: any[] },
  eventName: string
): any {
  const event = receipt.logs
    .map((log) => {
      try {
        return contract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((parsed: any) => parsed?.name === eventName);

  if (!event) throw new Error(`${eventName} event not found`);
  // const { ownershipCode, tempOwner } = event.args;

  return event.args;
}
