import pactum from 'pactum';
import { LoginDto, RegisterDto } from './dto';
import { Role, Status, User } from '@prisma/client';

export const AuthTestSuite = () => {
  describe('AuthController', () => {
    const loginPayload: LoginDto = {
      email: 'john.doe@example.mail',
      password: 'Verysecret123!',
    };

    const anotherLoginPayload: LoginDto = {
      email: 'biboo@example.mail',
      password: 'Verysecret123!',
    };

    describe('POST /auth/register', () => {
      it('should return bad request if payload is empty', async () => {
        const res = await pactum.spec().post('/auth/register').withJson({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({
          statusCode: 400,
          message: [
            'first_name should not be empty',
            'first_name must be a string',
            'last_name should not be empty',
            'last_name must be a string',
            'phone_number must contain only digits and starts with country code',
            'email must be an email',
            'password must be 8+ characters and contain at least 1 uppercase, 1 number, and 1 symbol',
          ],
          error: 'Bad Request',
        });
      });

      it('should return bad request if payload is invalid', async () => {
        const badPayload = {
          first_name: 'John',
          last_name: 'Doe',
          phone_number: 'this is not phone number',
          email: 'this is not email',
          password: 'badpassword',
        };

        await pactum
          .spec()
          .post('/auth/register')
          .withJson(badPayload)
          .expectJson({
            statusCode: 400,
            message: [
              'phone_number must contain only digits and starts with country code',
              'email must be an email',
              'password must be 8+ characters and contain at least 1 uppercase, 1 number, and 1 symbol',
            ],
            error: 'Bad Request',
          });
      });

      it('should create new user with investor role', async () => {
        const payload: RegisterDto = {
          first_name: 'John',
          last_name: 'Doe',
          phone_number: '621122334455',
          ...loginPayload,
        };

        const res = await pactum
          .spec()
          .post('/auth/register')
          .withJson(payload)
          .expectStatus(201);

        type NewUser = Omit<User, 'password' | 'created_at' | 'updated_at'>;

        expect(res.body).toMatchObject<NewUser>({
          id: expect.any(String),
          first_name: payload.first_name,
          last_name: payload.last_name,
          phone_number: payload.phone_number,
          email: payload.email,
          role: Role.INVESTOR,
          status: Status.ACTIVE,
          refresh_token: null,
        });
      });

      it('should create another new user with investor role', async () => {
        const payload: RegisterDto = {
          first_name: 'Koseki',
          last_name: 'Biboo',
          phone_number: '621122334499',
          ...anotherLoginPayload,
        };

        const res = await pactum
          .spec()
          .post('/auth/register')
          .withJson(payload)
          .expectStatus(201);

        type NewUser = Omit<User, 'password' | 'created_at' | 'updated_at'>;

        expect(res.body).toMatchObject<NewUser>({
          id: expect.any(String),
          first_name: payload.first_name,
          last_name: payload.last_name,
          phone_number: payload.phone_number,
          email: payload.email,
          role: Role.INVESTOR,
          status: Status.ACTIVE,
          refresh_token: null,
        });
      });

      it('should return conflict if email or phone already exists', async () => {
        const payload: RegisterDto = {
          first_name: 'John',
          last_name: 'Doe',
          phone_number: '621122334455',
          ...loginPayload,
        };

        await pactum
          .spec()
          .post('/auth/register')
          .withJson(payload)
          .expectStatus(409);
      });
    });

    describe('POST /auth/login', () => {
      it('should return bad request if payload is empty', async () => {
        const res = await pactum.spec().post('/auth/login').withJson({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toStrictEqual({
          statusCode: 400,
          message: ['email must be an email', 'password must be a string'],
          error: 'Bad Request',
        });
      });

      it('should return bad request if payload is invalid', async () => {
        const badPayload = {
          email: 'this is not email',
          password: 'verysecretpassword',
        };

        await pactum
          .spec()
          .post('/auth/login')
          .withJson(badPayload)
          .expectJson({
            statusCode: 400,
            message: ['email must be an email'],
            error: 'Bad Request',
          });
      });

      it('should return unauthorized if email does not exist', async () => {
        const badPayload: LoginDto = {
          email: 'not.exist@example.mail',
          password: 'verysecretpassword',
        };

        await pactum
          .spec()
          .post('/auth/login')
          .withJson(badPayload)
          .expectJson({
            statusCode: 401,
            message: 'Invalid credentials',
            error: 'Unauthorized',
          });
      });

      it('should return unauthorized if password is incorrect', async () => {
        const badPayload: LoginDto = {
          email: 'john.doe@example.mail',
          password: 'wrongpassword',
        };

        await pactum
          .spec()
          .post('/auth/login')
          .withJson(badPayload)
          .expectJson({
            statusCode: 401,
            message: 'Invalid credentials',
            error: 'Unauthorized',
          });
      });

      it('should return access token and refresh token', async () => {
        const res = await pactum
          .spec()
          .post('/auth/login')
          .withJson(loginPayload)
          .expectStatus(200)
          .stores('email', 'email')
          .stores('access_token', 'access_token')
          .stores('refresh_token', 'res.headers.set-cookie[0]')
          .stores('user_id', 'id');

        expect(res.headers).toHaveProperty('set-cookie');

        expect(res.body).toStrictEqual({
          id: expect.any(String),
          first_name: expect.any(String),
          last_name: expect.any(String),
          email: loginPayload.email,
          role: expect.any(String),
          access_token: expect.any(String),
        });
      });

      it('should return another user access token and refresh token', async () => {
        const res = await pactum
          .spec()
          .post('/auth/login')
          .withJson(anotherLoginPayload)
          .expectStatus(200)
          .stores('email', 'email')
          .stores('another_access_token', 'access_token')
          .stores('another_user_id', 'id');

        expect(res.headers).toHaveProperty('set-cookie');

        expect(res.body).toStrictEqual({
          id: expect.any(String),
          first_name: expect.any(String),
          last_name: expect.any(String),
          email: anotherLoginPayload.email,
          role: expect.any(String),
          access_token: expect.any(String),
        });
      });

      it('should return admin access token and admin refresh token', async () => {
        const adminPayload: LoginDto = {
          email: 'admin@example.mail',
          password: 'Verysecret123!',
        };

        const res = await pactum
          .spec()
          .post('/auth/login')
          .withJson(adminPayload)
          .expectStatus(200)
          .stores('email', 'email')
          .stores('admin_access_token', 'access_token')
          .stores('user_id', 'id');

        expect(res.headers).toHaveProperty('set-cookie');

        expect(res.body).toStrictEqual({
          id: expect.any(String),
          first_name: expect.any(String),
          last_name: expect.any(String),
          email: adminPayload.email,
          role: expect.any(String),
          access_token: expect.any(String),
        });
      });
    });

    describe('POST /auth/forgot-password', () => {
      it('should return bad request if payload is empty', async () => {
        const res = await pactum
          .spec()
          .post('/auth/forgot-password')
          .withJson({})
          .expectStatus(400);

        expect(res.body).toStrictEqual({
          statusCode: 400,
          message: ['email must be an email'],
          error: 'Bad Request',
        });
      });

      it('should return bad request if payload is invalid', async () => {
        const badPayload = {
          email: 'this is not email',
        };

        await pactum
          .spec()
          .post('/auth/forgot-password')
          .withJson(badPayload)
          .expectJson({
            statusCode: 400,
            message: ['email must be an email'],
            error: 'Bad Request',
          });
      });

      it('should return not found if email does not exist', async () => {
        const badPayload = {
          email: 'not.exist@example.mail',
        };

        await pactum
          .spec()
          .post('/auth/forgot-password')
          .withJson(badPayload)
          .expectStatus(404);
      });

      it('should return ok and send reset password email if user exists', async () => {
        const res = await pactum
          .spec()
          .post('/auth/forgot-password')
          .withJson({
            email: '$S{email}',
          })
          .expectStatus(200)
          .stores('reset_token', 'reset_token');

        expect(res.body).toMatchObject({
          message: 'Reset password email sent',
          info_id: expect.any(String),
          reset_token: expect.any(String),
        });
      }, 10000);
    });

    describe('POST /auth/reset-password', () => {
      it('should return bad request if payload is empty', async () => {
        const res = await pactum
          .spec()
          .post('/auth/reset-password')
          .withJson({})
          .expectStatus(400);

        expect(res.body).toStrictEqual({
          statusCode: 400,
          message: [
            'new password must be 8+ characters and contain at least 1 uppercase, 1 number, and 1 symbol',
            'token must be a string',
          ],
          error: 'Bad Request',
        });
      });

      it('should return bad request if payload is invalid', async () => {
        const badPayload = {
          new_password: 'NewVerysecret123!',
          token: 123,
        };

        await pactum
          .spec()
          .post('/auth/reset-password')
          .withJson(badPayload)
          .expectJson({
            statusCode: 400,
            message: ['token must be a string'],
            error: 'Bad Request',
          });
      });

      it('should return error if reset token is invalid', async () => {
        const invalidPayload = {
          new_password: 'NewVerysecret123!',
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiZEhscTZuYXZaNHk5ZVhzNE1lSUhCIiwiZW1haWwiOiJyaWhsYW5yaWhsYW4yNEBnbWFpbC5jb20iLCJyb2xlIjoiSU5WRVNUT1IiLCJpYXQiOjE2OTc1NjU1MDYsImV4cCI6MTY5ODE3MDMwNn0.kO-6boxTN1b7qZNNnfVud3ThbAwM3c0jbA_B3dKKHDI',
        };

        await pactum
          .spec()
          .post('/auth/reset-password')
          .withJson(invalidPayload)
          .expectStatus(401)
          .expectJson({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Token invalid or expired',
          });
      });

      it('should return error if reset token is valid but new password not pass requirement', async () => {
        const res = await pactum
          .spec()
          .post('/auth/reset-password')
          .withJson({
            new_password: 'newverysecretpassword',
            token: '$S{reset_token}',
          })
          .expectStatus(400);

        expect(res.body).toStrictEqual({
          statusCode: 400,
          error: 'Bad Request',
          message: [
            'new password must be 8+ characters and contain at least 1 uppercase, 1 number, and 1 symbol',
          ],
        });
      });

      it('should return ok if reset token is valid and new password pass requirement', async () => {
        const res = await pactum
          .spec()
          .post('/auth/reset-password')
          .withJson({
            new_password: 'NewVerysecret123!',
            token: '$S{reset_token}',
          })
          .expectStatus(200);

        expect(res.body).toStrictEqual({
          status: 'success',
          message: 'Password changed successfully',
        });
      });
    });

    describe('GET /auth/refresh-token', () => {
      it('should return error if no refresh token provided in cookie', async () => {
        await pactum.spec().get('/auth/refresh-token').expectStatus(401);
      });

      it('should return new access token using refresh token provided in cookie', async () => {
        const res = await pactum
          .spec()
          .get('/auth/refresh-token')
          .withCookies(`$S{refresh_token}`)
          .expectStatus(200);

        expect(res.body).toMatchObject({
          access_token: expect.any(String),
        });
      });
    });

    describe('DELETE /auth/logout', () => {
      it('should return unauthorized if user is not logged in', async () => {
        await pactum.spec().delete('/auth/logout').expectStatus(401);
      });
      it('should return ok if bearer token is provided', async () => {
        await pactum
          .spec()
          .delete('/auth/logout')
          .withBearerToken(`$S{access_token}`)
          .expectStatus(200)
          .expectJson({
            status: 'success',
            message: 'Account logged out successfully',
          });
      });
    });
  });
};
