module.exports = function vgComplete(dispatch) {
    //complete vgs
    dispatch.hook('S_COMPLETE_EVENT_MATCHING_QUEST', event => {
        dispatch.toServer('C_COMPLETE_DAILY_EVENT', 1, {
            id: event.id
        });
        return false;
    });

    //after you complete vg, send request for vg window list
    dispatch.hook('S_DAILY_QUEST_COMPLETE_COUNT', 1, event =>{
        dispatch.toServer('C_AVAILABLE_EVENT_MATCHING_LIST', 1, {
            unk: 0
            //asking match list without opening vg window: 0
        });
    });

    //whenever vg window list is asked check & complete weekly/daily
    dispatch.hook('S_AVAILABLE_EVENT_MATCHING_LIST', 2, event => {
        if (event.callMethod == -1 || event.callMethod == 1) {
            // check daily3
            if (!event.daily3Complete && event.dailyCount >= 3) {
                complete(1);
            }
            //check daily8
            if (event.daily8Available && (event.outOfDailies /*||event.dailyCount == 8 */)) {
                complete(1);
            }
            //check weekly
            if (event.weeklyAvailable && event.weeklyCount == 15) {
                complete(0);
            }
        }
    });

    function complete(nmbr) {
        // daily = 1, weekly = 0
        dispatch.toServer('C_COMPLETE_EXTRA_EVENT', 1, {
            type: nmbr
        });
    }
}