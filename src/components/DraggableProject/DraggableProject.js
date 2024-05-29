import React from 'react';
import { useDrag, useDrop } from 'react-dnd';

const ItemType = 'PROJECT';

const DraggableProject = ({ index, moveProject, children }) => {
    const ref = React.useRef(null);
    const [, drop] = useDrop({
        accept: ItemType,
        hover(item) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;
            moveProject(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemType,
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    return (
        <div
            ref={ref}
            className={`draggable-project ${isDragging ? 'is-dragging' : ''}`}
            style={{ opacity: isDragging ? 0.5 : 1 }}
        >
            {children}
        </div>
    );
};

export default DraggableProject;