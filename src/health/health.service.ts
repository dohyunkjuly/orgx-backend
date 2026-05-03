import { Injectable } from '@nestjs/common'

@Injectable()
export class HealthService {
  check() {
    // {
    //   "statusCode": 200,
    //   "code": 0,
    //   "data": null,
    //   "message": "OK"
    // }
    return null
  }
}
