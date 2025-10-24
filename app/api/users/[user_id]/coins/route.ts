import { NextResponse } from 'next/server';

// This is a mock database of user coin balances.
// In a real-world application, you would replace this with a call to your actual database.
// This should be consistent with the data in other API routes.
const userCoinBalances: { [key: string]: number } = {
  "1": 1000, // User 1 starts with 1000 coins
  "user_abc": 500,
  "user_xyz": 250,
};

/**
 * Handles the GET request to fetch a user's coin balance.
 * @param request The incoming request object.
 * @param params The dynamic route parameters, containing user_id.
 */
export async function GET(
  request: Request,
  { params }: { params: { user_id: string } }
) {
  try {
    const { user_id } = params;

    // 1. Check for Authorization
    // In a real app, you would validate the JWT. Here, we just check for its presence.
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }

    // 2. Validate user_id
    if (!user_id) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // 3. Fetch user's coins from the mock database
    const userCoins = userCoinBalances[user_id];

    if (userCoins === undefined) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // 4. Return a success response
    console.log(`Fetched coin balance for user ${user_id}: ${userCoins}`);
    return NextResponse.json({
      userId: user_id,
      coins: userCoins,
    });

  } catch (error) {
    console.error(`An error occurred while fetching coins for user:`, error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
