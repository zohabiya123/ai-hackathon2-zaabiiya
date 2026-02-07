// app/api/todos/route.ts
import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (in a real app, you'd use a database)
let todos: Array<{
  id: number;
  text: string;
  completed: boolean;
  createdAt: Date;
}> = [];

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({ todos });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid todo text' }, { status: 400 });
    }

    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date(),
    };

    todos.push(newTodo);

    return NextResponse.json(newTodo, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.pathname.split('/').pop() || '0');
    
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    const body = await request.json();
    const { completed } = body;

    todos[todoIndex].completed = completed;

    return NextResponse.json(todos[todoIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.pathname.split('/').pop() || '0');

    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex === -1) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    const deletedTodo = todos.splice(todoIndex, 1)[0];

    return NextResponse.json(deletedTodo);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
}