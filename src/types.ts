export type Car = {
  brand: string,
  name: string,
  year: number,
  price: number,
}

export type RequestServerResponse = {
  statusCode: number,
  data: string | Buffer,
}