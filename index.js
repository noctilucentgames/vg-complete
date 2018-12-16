const Command = require('command')
const onByDefault = true
module.exports = function vgComplete(dispatch) {
    const command = new Command(dispatch)
    command.add('vgcomplete', toggle)

    var enabled = false;
    if (onByDefault) enable()

    var h1, h2, h3
    function toggle() {
        if (enabled) disable()
        else enable()
        command.message(`VGComplete ${enabled ? 'ON' : 'OFF'}`)
    }

    function disable() { 
        enabled = false
        for (h of [h1,h2,h3]) { if (h) dispatch.unhook(h) }
    }
    function enable() {
        enabled = true
        h1 = dispatch.hook('S_COMPLETE_EVENT_MATCHING_QUEST', 1, event => { //complete vgs
            dispatch.toServer('C_COMPLETE_DAILY_EVENT', 1, { id: event.id });
            return false;
        });
        h2 = dispatch.hook('S_DAILY_QUEST_COMPLETE_COUNT', 1, event => { //after you complete vg, send request for vg window list
            dispatch.toServer('C_AVAILABLE_EVENT_MATCHING_LIST', 1, { unk: 0 }); //asking match list ( without opening vg window -> unk: 0 )
        });
        var cd = false
        h3 = dispatch.hook('S_AVAILABLE_EVENT_MATCHING_LIST', 3, event => { //whenever vg window list is asked check & complete weekly/daily
            if (event.callMethod != 0) {
                if (!event.daily3Complete && event.dailyCount >= 3) { // check daily3
                    dispatch.toServer('C_COMPLETE_EXTRA_EVENT', 1, { type: 1 });
                }
                if (event.daily8Available && event.dailyCount >= 8) { //check daily8
                    dispatch.toServer('C_COMPLETE_EXTRA_EVENT', 1, { type: 1 });
                }
                if (event.weeklyAvailable && event.weeklyCount == 16) { //check weekly
                    dispatch.toServer('C_COMPLETE_EXTRA_EVENT', 1, { type: 0 });
                }
                if (event.vgCredits > 8000 && !cd) { //warning if credits almost capped
                    dispatch.toClient('S_DUNGEON_EVENT_MESSAGE', 2, {
                        type: 49,
                        message: `Vanguard Credits almost capped: ${event.vgCredits}/9000`
                    })
                    cd = true
                    setTimeout(function () { cd = false }, 20000) // dont show credit warning again for the next 20 seconds
                }
                if (!event.daily8Available && event.vgWindow) { //show how many dailies left after completing daily8
                    event.dailyProgressCount = event.dailyCount
                    event.dailyProgressLimit = 16
                    return true
                }
            }
        });
    }
}