import { NextRequest, NextResponse } from 'next/server';
import { generateCommunicationMessage } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userType, messageType, channel, customPrompt } = body;

    if (!userType || !messageType || !channel) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const message = await generateCommunicationMessage(
      userType,
      messageType,
      channel,
      customPrompt
    );

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error in generate-message API:', error);
    return NextResponse.json(
      { error: 'Failed to generate message' },
      { status: 500 }
    );
  }
}
