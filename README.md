# ReserveNow Back

You need to provide .env file with following values:

- `POSTGRES_HOST`: host of the server.
- `POSTGRES_PORT`: port of the server.
- `SERVER_PORT`: the HTTP port to bind server to.
- `SECRET`: secret key for access token (SH256 (Secure Hash))
- `REFRESH_SECRET`: secret key for refresh token (SH256 (Secure Hash))
- `RESET_SECRET`: secret key for reset token (SH256 (Secure Hash))
- `VERIFY_SECRET`: secret key for verify token (SH256 (Secure Hash))

Build and start the container:

```sh
docker build -t reservenow-back .
docker run --env-file=.env -p 3000:3000 reservenow-back
```

API Link:

`localhost:3000/api#/`
