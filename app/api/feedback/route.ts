import { NextRequest, NextResponse } from 'next/server';

const GITHUB_REPO = 'ankurmans/shipcred'; // owner/repo
const GITHUB_TOKEN = process.env.GITHUB_FEEDBACK_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, name, email } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    if (!GITHUB_TOKEN) {
      console.error('GITHUB_FEEDBACK_TOKEN not configured');
      return NextResponse.json(
        { error: 'Feedback system is not configured' },
        { status: 500 }
      );
    }

    // Build issue body
    const labels = ['feature-request'];
    if (category) labels.push(category);

    const issueBody = [
      description,
      '',
      '---',
      `**Category:** ${category || 'General'}`,
      name ? `**Submitted by:** ${name}` : null,
      email ? `**Contact:** ${email}` : null,
      '',
      '_Submitted via gtmcommit.com/feedback_',
    ]
      .filter(Boolean)
      .join('\n');

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/issues`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `[Feedback] ${title}`,
          body: issueBody,
          labels,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('GitHub API error:', error);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 502 }
      );
    }

    const issue = await response.json();

    return NextResponse.json({
      success: true,
      issueUrl: issue.html_url,
      issueNumber: issue.number,
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
