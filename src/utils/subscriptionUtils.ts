import { SERVER_BASE_URL, getServerHeaders } from './apiConfig';

// Check if user has an active subscription (Supabase 기반)
export async function hasActiveSubscription(): Promise<boolean> {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  if (!currentUser.email) {
    return false;
  }

  try {
    const response = await fetch(`${SERVER_BASE_URL}/subscriptions`, {
      headers: getServerHeaders()
    });
    if (!response.ok) return false;
    
    const subscriptions = await response.json();
    const userSubscription = subscriptions.find((sub: any) => 
      sub.email === currentUser.email && sub.status === 'Active'
    );

    if (!userSubscription) return false;

    // Check if subscription is still valid
    const expiryDate = new Date(userSubscription.expiryDate);
    const today = new Date();
    return expiryDate >= today;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

// Check if specific content should be locked
// Deprecated: localStorage-based subscription system replaced by Supabase license system
// Always return false to allow access; actual permission check is done in launchSection
export function isContentLocked(index: number, lockedFrom: number = 3): boolean {
  return false;
}
