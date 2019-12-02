
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJS9ljvSGPkYvzMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi1sc3V0dmd3eS5hdXRoMC5jb20wHhcNMTkxMTI3MDcyODQ3WhcNMzMw
ODA1MDcyODQ3WjAhMR8wHQYDVQQDExZkZXYtbHN1dHZnd3kuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2KsS9NE4a1A6NM40X6SrLXPL
or1Dw58ydsS/+FZ6aAb1QSDPecis8KC5piJR0uozzPWp67L9fFFui98WFhqXgHvV
OGqxfBuLW1//91JoUm5yzs5rGvMOeoLi7L4A1GCRsl7Zletjqoy61syWXnuzMwfZ
4yGOqb+bORTnfxFUZ6iFjWU9qKVUgh+Tl7n6vrlmsh/U/6tTSeMjCLnp2YqMV27t
Ubd3Scb6ht9sfDqw7FPlGgIb5f3UE0zOZahHNlqjU1itfB5s1dPfVxqeMuaVAG95
d6r0p+ReBCWWXH3hrqUuccH0YhXFL7A2uUhvkciK/UxrgHulxnxuk5uIIoQsUQID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSswi5eo3ERyabG+CRQ
x0jqbwjDKzAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAAFmvaTB
wZAyG9e62Fo7yfzyFkYmiVZ3J6KMhXKO1zaF8gaIv0fGHXCuVrSeqWxYIa6U1ifq
9hy2gIvZjoNHLUdv85Q6tDqwwBPQvMqpFxozap6T7ZNqbg2E+tvmU520QdbeHYSA
fcTIgsHBOeOe+Of0ouyvpp9cSKNM5AKnmhExmgBnHZLIWiyC/rOpZ4Y5GtFZdBtk
yfoYxFK2A9UoO3/AV9OBBPkCckhi3hcnPELIVWECSlTFF64A470zRWwvm6/s/Y8U
hxBzhbSdUvh8b+fUp3Nlnklf4wmNroxA9/A/heZWgWNdSj9jjHvVO8wRG/JlQR64
s7wYm/l/4D5KJ/w=
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
