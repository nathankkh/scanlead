interface Event {
  Name: string;
  Date: fsDate | object;
  id: string;
}

interface fsDate {
  _seconds: number;
  _nanoseconds: number;
}
export default Event;
