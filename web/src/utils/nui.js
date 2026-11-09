export const isEnvBrowser = () => !window.invokeNative;

export async function fetchNui(eventName, data = {}) {
  if (isEnvBrowser()) {
    console.log(`[Browser Mock NUI] Called ${eventName} with:`, data);

    if (eventName === 'getCurrentCoords') {
      return {
        x: Number((Math.random() * 500 - 250).toFixed(2)),
        y: Number((Math.random() * 500 - 250).toFixed(2)),
        z: 30.55,
        w: Number((Math.random() * 360).toFixed(1)),
      };
    }

    if (eventName === 'saveGarage' || eventName === 'deleteGarage' || eventName === 'spawnVehicle' || eventName === 'teleportToCoords') {
      return { success: true };
    }

    return { success: true };
  }

  const resourceName = window.GetParentResourceName ? window.GetParentResourceName() : 'qbx_garages';
  try {
    const resp = await fetch(`https://${resourceName}/${eventName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(data),
    });
    return await resp.json();
  } catch (err) {
    return null;
  }
}
