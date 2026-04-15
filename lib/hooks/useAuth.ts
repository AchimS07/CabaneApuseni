// Re-export from the central providers module so consumers import from a
// predictable lib path without depending directly on the app/ tree.
export { useAuth } from '../../app/providers';
