import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from 'src/entity/setting.entity';
import { Repository } from 'typeorm';
import moment from "moment";
import 'moment-timezone';
import { Users } from 'src/entity/user.entity';

@Injectable()
export class SettingService {

  constructor(
    @InjectRepository(Setting)
    private settingRespository: Repository<Setting>,
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
  ) { }

  createSettingRecord(req, res, loginUser) {
    return new Promise(async (resolve, reject) => {
      try {
        let settingObj, tzForUser, start24TimeInHrMn, end24TimeInHrMn;

        const settingObjDetail = await this.settingRespository.findOne({
          where: {
            userId: loginUser.sub
          }
        })

        if (!settingObjDetail || settingObjDetail == null) {
          settingObj = new Setting();
        } else {
          settingObj = settingObjDetail;
        }

        settingObj.sleepStartTime = req.sleepStartTime ?? settingObj.sleepStartTime;
        settingObj.userId = loginUser.sub;
        settingObj.type = "notificationSetting";
        settingObj.sleepEndTime = req.sleepEndTime ?? settingObj.sleepEndTime;
        settingObj.checkinTime = req.checkinTime ?? settingObj.checkinTime;

        var st = req.sleepStartTime.split(" ");
        var et = req.sleepEndTime.split(" ");

        settingObj.sleepStartTimeIn24Format = st[0];
        settingObj.sleepEndTimeIn24Format = et[0];

        if (req.checkinTime != 30) {
          settingObj.checkinTimeInMinutes = req.checkinTime * 60;
        } else {
          settingObj.checkinTimeInMinutes = 30;
        }

        const userObj = await this.userRepository.findOne({
          where: {
            id: loginUser.sub
          }
        })

        let sdateTime = moment(req.sleepStartTime, 'hh:mm A').format('yyyy-MM-DD HH:mm:ss');
        let edateTime = moment(req.sleepEndTime, 'hh:mm A').format('yyyy-MM-DD HH:mm:ss');

        console.log({ sdateTime }, { edateTime })

        if (userObj.userTimezone) {
          let combineTz;
          let statictime = "-06:00";

          if (userObj.userTimezone.indexOf("-") != -1) {
            combineTz = userObj.userTimezone.split("-");
            combineTz[1] = `+${combineTz[1]}`;
          } else {
            combineTz = userObj.userTimezone.split("+");
            combineTz[1] = `-${combineTz[1]}`
          }

          if (combineTz[1]) {
            start24TimeInHrMn = moment(sdateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(combineTz[1]).format('HH:mm:ss');
            end24TimeInHrMn = moment(edateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(combineTz[1]).format('HH:mm:ss');
          } else {
            start24TimeInHrMn = (moment(sdateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(statictime)).format('HH:mm:ss');
            end24TimeInHrMn = (moment(edateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(statictime)).format('HH:mm:ss');
          }
        } else {
          let statictime = "-06:00";
          start24TimeInHrMn = (moment(sdateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(statictime)).format('HH:mm:ss');
          end24TimeInHrMn = (moment(edateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(statictime)).format('HH:mm:ss');
        }

        settingObj.sleepStartTimeIn24Format = start24TimeInHrMn;
        settingObj.sleepEndTimeIn24Format = end24TimeInHrMn;


        let record = await this.settingRespository.save(settingObj);

        resolve({
          status: true,
          message: `Setting saved successfully!!`,
          result: record
        })

      }
      catch (e) {
        console.log(e);
        reject({
          status: false,
          error: 'Error, please check server logs for more information...'
        });
      }
    })
  }

  getCheckinLIst(req, res) {
    return new Promise(async (resolve, reject) => {
      try {

        let record = [
          { "checkinTime": "1" },
          { "checkinTime": "2" },
          { "checkinTime": "6" },
          { "checkinTime": "12" },
          { "checkinTime": "24" }
        ];

        resolve({
          status: true,
          message: `List Fetched successfully!!`,
          result: record
        })
      }
      catch (e) {
        console.log(e);
        reject({
          status: false,
          error: 'Error, please check server logs for more information...'
        });
      }
    })
  }

}
