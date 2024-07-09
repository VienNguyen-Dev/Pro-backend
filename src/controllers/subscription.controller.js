
import { Subsription } from "../models/subcription.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { chanelId } = req.params;
  const subscribberId = req.user._id;
  //Todo: toggle subscription


  let subscription = await Subsription.findOne({
    subscriber: subscribberId,
    chanel: chanelId
  });
  if (subscription) {
    await subscription.remove();
    throw new ApiError(400, "Unsubscribed succssfully")
  }

  subscription = new Subsription({
    subcriber: subscribberId,
    chanel: chanelId
  })

  return res
    .status(200)
    .json(new ApiResponse(
      200,
      subscription,
      "Add subscriber successfully"
    ))
})


//controler return list of subscriber of chanel
//Controler nay se tra ra mot danh sach cac subscriber => chanel
const getUserChanelSubscriber = asyncHandler(async (req, res) => {
  const { chanelId } = req.params;
  const subscriptions = await Subsription.find({ chanel: chanelId });
  if (!subscriptions) {
    throw new ApiError(404, "Subscriber not found")
  }
  const subscribers = subscriptions.map((sub) => sub.subcriber);
  return res
    .status(200)
    .json(new ApiResponse(
      200,
      subscribers,
      "Subscriber fetched successfully"
    ))
})

//controller return a list of subcribed whhich has user subscribed
//return mot danh sach cac kenh ma nguoi dung da dang ki 
// "/subcriber/:chanelId"
//1. tim kiem cac subscriptions co chanelId
//2. 
const getSubscribedChanel = asyncHandler(async (req, res) => {
  const { subscribedId } = req.params;

  const subscriptions = await Subsription.find({ subscriber: subscribedId }).populate();
  if (!subscriptions) {
    throw new ApiError(404, "User does not subscribed chanel");
  }

  const chanel = subscriptions.map((chal) => chal.chanel)
  return res
    .status(200)
    .json(new ApiResponse(
      200,
      chanel,
      "Subscribed of user fetched successfully"
    ))
})

export { toggleSubscription, getSubscribedChanel, getUserChanelSubscriber }