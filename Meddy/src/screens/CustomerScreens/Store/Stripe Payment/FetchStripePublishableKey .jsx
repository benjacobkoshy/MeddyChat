


export async function fetchStripePublishableKey(API_BASE_URL) {
  console.log(API_BASE_URL);
  try {
      const response = await fetch(`${API_BASE_URL}/product/get-stripe-key/`,{
        method: 'GET',
      });
      const { publishableKey } = await response.json();
      return publishableKey;
    } catch (error) {
      console.error('Error fetching Stripe publishable key:', error);
      return null;
    }
  }
  