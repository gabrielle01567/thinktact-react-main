// Debug utilities for authentication issues

export const clearAllStorage = () => {
  console.log('🧹 Clearing all localStorage...');
  localStorage.clear();
  console.log('✅ localStorage cleared');
};

export const checkTokenStatus = () => {
  const token = localStorage.getItem('thinktact_token');
  const user = localStorage.getItem('thinktact_user');
  
  console.log('🔍 Current token status:');
  console.log('  Token:', token ? token.substring(0, 20) + '...' : 'null');
  console.log('  User:', user ? JSON.parse(user).email : 'null');
  
  return { token, user };
};

export const forceTokenRefresh = () => {
  console.log('🔄 Force refreshing token...');
  clearAllStorage();
  window.location.reload();
}; 