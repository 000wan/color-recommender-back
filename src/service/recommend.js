const kmeans = require('node-kmeans');

const { rgb2lab, lab2rgb } = require('rgb-lab');

const rgbToHex = ( rgbArr ) => '#' + rgbArr.map(x => {
  const hex = Math.floor(x).toString(16)
  return hex.length === 1 ? '0' + hex : hex
}).join('');

const hexToRgb = ( hex ) => {
  return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16))
}

const createRecommend = async ( logData, recommendSize ) => {
  // logData { index: Number, color: String, timestamp: Date }
  const data = logData.map((x) => rgb2lab(hexToRgb(x.color))); // convert from RGB to CIE LAB space
  let result = [];

  await kmeans.clusterize(data, { k: recommendSize }, (err, res) => {
    if (err) {
      console.log('[Error from kmeans] ' + err);
      return [];
    }

    // res: Object{ centroid: vector, cluster: vector[], clusterInd: number[] }
    res.sort((a, b) => {
      return -(a.clusterInd.length - b.clusterInd.length); // descending order with cluster size
    });
    //console.log(res);

    result = res;
  });

  return result;
}

// handler function
const { UserModel } = require('../models/user');

const recommendHandler = async (req, res) => {
  const recommendSize = 5; // cluster number of k-means
  const user = req.user;

  // from cluster object to color hex
  const clusterToColor = (data) => data.map((x) => rgbToHex(lab2rgb(x.centroid)));

  // If you want to test, first do:
  // db.users.findOneAndUpdate({username: 'USERNAME'}, {$set: { recommend: {data:[]}} })
  try {
    if ( user.recommend.data.length > 0 ) { // already has recommend data
      return res.status(200).json({ 
        success: true,
        data: clusterToColor(user.recommend.data)
      });
    }
    if ( user.log.length < recommendSize ) { // not enough datas
      return res.status(200).json({ 
        success: true,
        data: []
      });
    }
  
    const recommendData = await createRecommend(user.log, recommendSize); // execute kmeans
    // console.log(recommendData);

    UserModel.findOneAndUpdate({ _id: user._id }, {
      recommend: {
        data: recommendData,
        timestamp: new Date()
      }
    }, { returnDocument: 'after' }, (err, user) => {
      if ( err ) {
        return res.status(500).json({ 
          success: false,
          data: []
        });
      }
      // centroid is currently in LAB space. convert to RGB hex

      return res.status(200).json({ 
        success: true,
        data: clusterToColor(user.recommend.data)
      });
    });
  } catch (e) {
    return res.status(500).json({ 
      success: false,
      data: []
    });
  }
}

module.exports = { recommendHandler };