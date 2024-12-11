import { IRequest, RequestModel } from "@models/request.model";

async function createRequest(input: IRequest) {
  try {
    const request = await RequestModel.create(input);
    return request;
  } catch (e: any) {
    throw new Error(e.message);
  }
}
async function FindRequestExistsCreate(sender: string, receiver: string) {
  try {
    const request = await RequestModel.findOne({
      $or: [
        { sender: receiver, receiver: sender },
        { sender: sender, receiver: receiver },
      ],
    });
    return request;
  } catch (e: any) {
    throw new Error(e.message);
  }
}
async function FindRequestById(requestId: string) {
  try {
    const request = await RequestModel.findOne({ _id: requestId }).populate(
      "sender receiver"
    );
    return request;
  } catch (e: any) {
    throw new Error(e.message);
  }
}
async function deleteRequest(requestId: string) {
  try {
    const request = await RequestModel.findOneAndDelete({ _id: requestId });
    console.log(request);
    return request;
  } catch (e: any) {
    throw new Error(e.message);
  }
}
async function FindRequestBySender(
  skip: number,
  limit: number,
  userId: string
) {
  try {
    const [request, total] = await Promise.all([
      RequestModel.find({
        $and: [{ receiver: userId }],
      })
        .select("-receiver")
        .populate("sender", "firstName lastName avatar.url")
        .skip(skip)
        .limit(limit)
        .lean(),
      RequestModel.countDocuments({
        $and: [{ receiver: userId }],
      }),
    ]);
    const totalPages = Math.ceil(total / limit) || 0;
    return { request, totalPages, total };
  } catch (e: any) {
    throw new Error(e.message);
  }
}

export {
  createRequest,
  FindRequestExistsCreate,
  FindRequestById,
  deleteRequest,
  FindRequestBySender,
};
