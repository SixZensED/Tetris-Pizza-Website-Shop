import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } },
) {
  try {
    const { user_id } = params;
    console.log(`Fetching transactions for user: ${user_id}`);

    // Mock transactions data
    const mockTransactions = [
      {
        transaction_id: 1,
        order_id: 10,
        amount: "414.00",
        transaction_type: "purchase",
        status: "completed",
        description: "Purchased menu items",
        created_at: "2025-10-23T06:49:00.000Z",
        total_amount: "414.00",
        order_status: "completed",
      },
      {
        transaction_id: 2,
        order_id: null,
        amount: "500.00",
        transaction_type: "topup",
        status: "completed",
        description: "Added coins to account",
        created_at: "2025-10-22T15:30:00.000Z",
        total_amount: null,
        order_status: null,
      },
      {
        transaction_id: 3,
        order_id: 15,
        amount: "250.00",
        transaction_type: "purchase",
        status: "pending",
        description: "Purchased pizza and drinks",
        created_at: "2025-10-24T10:15:00.000Z",
        total_amount: "250.00",
        order_status: "pending",
      },
      {
        transaction_id: 4,
        order_id: null,
        amount: "1000.00",
        transaction_type: "topup",
        status: "completed",
        description: "Added coins to account",
        created_at: "2025-10-21T14:20:00.000Z",
        total_amount: null,
        order_status: null,
      },
      {
        transaction_id: 5,
        order_id: 8,
        amount: "320.00",
        transaction_type: "purchase",
        status: "failed",
        description: "Purchased special menu",
        created_at: "2025-10-20T18:45:00.000Z",
        total_amount: "320.00",
        order_status: "cancelled",
      },
    ];

    // Filter transactions by user_id if needed (for future implementation)
    // For now, return all mock transactions
    const userTransactions = mockTransactions;

    return NextResponse.json(
      {
        success: true,
        transactions: userTransactions,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transactions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
