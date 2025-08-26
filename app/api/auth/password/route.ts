import { NextResponse } from "next/server";
import { Client } from "pg";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const { user, oldPassword, newPassword } = await request.json();

    const result = await client.query(
      'SELECT clave FROM usuarios WHERE usuario = $1',
      [user]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    const storedHash = result.rows[0].clave;

    const passwordMatch = await bcrypt.compare(oldPassword, storedHash);
    if (!passwordMatch) {
      return NextResponse.json({ message: 'Contraseña actual inválida. Por favor, intente nuevamente' }, { status: 401 });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    await client.query(
      'UPDATE usuarios SET clave = $1 WHERE usuario = $2',
      [newHashedPassword, user]
    );

    const response = NextResponse.json({ message: 'OK' }, { status: 200 });

    return response;
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}