export function validateAdminPlugin(client: any, property: string) {
  if (!client) {
    throw new Error('AuthClient is not initialized.')
  }

  if (!client[property]) {
    throw new Error(
      `Property '${property}' is not available on authClient. Please ensure the plugin providing this property is included in the plugins array.`,
    )
  }
}
