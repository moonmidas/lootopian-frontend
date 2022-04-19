import { SECTIONS } from "../constants";

export default function listItemsToUnequip(obj) {    

    function sectionToLabel(section) {
        return SECTIONS.find(s => s.value === section).label;
    }

        let items = [];
        obj.forEach(item => {
            items.push({
                value: item.section_id,
                label: sectionToLabel(item.section_id)
            });
        });

        return items;
    }