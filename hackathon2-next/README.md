# Evolution Todo - Next.js Assignment

This is a [Next.js](https://nextjs.org) todo application built for educational purposes. The app features both client-side storage (localStorage) and server-side API functionality.

## Features

- ✅ Add, edit, and delete todos
- ✅ Mark todos as complete/incomplete
- ✅ Dark/light mode support
- ✅ Two storage options: localStorage and API backend
- ✅ Responsive design
- ✅ Real-time statistics

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

To build the application for production:

```bash
npm run build
```

After building, you can start the production server:

```bash
npm run start
```

## Deployment

### Deploy on Vercel (Recommended)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Deploy on Other Platforms

Most hosting platforms support Next.js out of the box:

1. **Netlify**: Connect your GitHub repo and set build command to `npm run build` and publish directory to `out`
2. **AWS Amplify**: Connect your GitHub repo and set build settings as per Next.js requirements
3. **Azure Static Web Apps**: Follow the Next.js deployment guide
4. **DigitalOcean App Platform**: Use the Next.js deployment template

## Project Structure

- `app/page.tsx` - Main page (redirects to todo page)
- `app/todo.tsx` - Main todo application component
- `app/api/todos/route.ts` - API routes for todo operations
- `app/layout.tsx` - Root layout with dark mode support
- `app/globals.css` - Global styles

## API Routes

The application includes a full CRUD API for todos:

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/[id]` - Update a todo
- `DELETE /api/todos/[id]` - Delete a todo

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
