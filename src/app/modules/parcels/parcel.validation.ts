{
  trackingId: string,
  sender: ObjectId,
  receiver: ObjectId,
  type: string,
  weight: number,
  address: string,
  fee: number,
  deliveryDate: Date,
  status: 'Requested' | 'Approved' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Cancelled',
  statusLogs: [
    {
      status: string,
      timestamp: Date,
      updatedBy: ObjectId,
      note: string
    }
  ]
}
