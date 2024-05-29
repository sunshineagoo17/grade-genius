import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './GradesCalculator.scss';

function GradesCalculator() {
    const [projects, setProjects] = useState(() => {
        const savedProjects = localStorage.getItem('projects');
        if (savedProjects) {
            const parsedProjects = JSON.parse(savedProjects);
            // Ensure all IDs are strings
            parsedProjects.forEach(project => {
                project.id = project.id.toString();
                project.sprints.forEach(sprint => {
                    sprint.id = sprint.id.toString();
                });
            });
            return parsedProjects;
        }
        return [];
    });

    const [targetGrade, setTargetGrade] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [isWeightValid, setIsWeightValid] = useState(true);

    useEffect(() => {
        localStorage.setItem('projects', JSON.stringify(projects));
    }, [projects]);

    const onDragEnd = (result) => {
        const { destination, source } = result;

        if (!destination) return;

        const updatedProjects = [...projects];
        const [movedProject] = updatedProjects.splice(source.index, 1);
        updatedProjects.splice(destination.index, 0, movedProject);
        setProjects(updatedProjects);
    };

    const handleAddProject = () => {
        const totalWeight = projects.reduce((sum, project) => sum + parseFloat(project.overall || 0), 0);
        if (totalWeight < 100) {
            const newProject = {
                id: projects.length.toString(),
                name: '',
                overall: '',
                sprints: [{ id: '0', score: '', weight: '' }]
            };
            setProjects([...projects, newProject]);
            setIsWeightValid(true);
        } else {
            setIsWeightValid(false);
        }
    };

    const handleAddSprint = (projectIndex) => {
        const newSprint = { id: projects[projectIndex].sprints.length.toString(), score: '', weight: '' };
        const updatedProjects = projects.map((project, index) =>
            index === projectIndex ? { ...project, sprints: [...project.sprints, newSprint] } : project
        );
        setProjects(updatedProjects);
    };

    const handleProjectChange = (projectIndex, field, value) => {
        const updatedProjects = projects.map((project, index) => {
            if (index === projectIndex) {
                return { ...project, [field]: value };
            }
            return project;
        });
        setProjects(updatedProjects);
    };

    const handleProjectBlur = (projectIndex) => {
        const totalWeight = projects.reduce((sum, project, idx) => {
            return sum + (idx === projectIndex ? parseFloat(projects[projectIndex].overall || 0) : parseFloat(project.overall || 0));
        }, 0);
        setIsWeightValid(totalWeight <= 100);
    };

    const handleSprintChange = (projectIndex, sprintIndex, field, value) => {
        const updatedProjects = projects.map((project, pIndex) => {
            if (pIndex === projectIndex) {
                const updatedSprints = project.sprints.map((sprint, sIndex) =>
                    sIndex === sprintIndex ? { ...sprint, [field]: value } : sprint
                );
                return { ...project, sprints: updatedSprints };
            }
            return project;
        });
        setProjects(updatedProjects);
    };

    const handleDeleteProject = (projectIndex) => {
        const updatedProjects = projects.filter((_, index) => index !== projectIndex);
        setProjects(updatedProjects);
    };

    const handleDeleteSprint = (projectIndex, sprintIndex) => {
        const updatedProjects = projects.map((project, pIndex) => {
            if (pIndex === projectIndex) {
                const updatedSprints = project.sprints.filter((_, sIndex) => sIndex !== sprintIndex);
                return { ...project, sprints: updatedSprints };
            }
            return project;
        });
        setProjects(updatedProjects);
    };

    const handleReset = () => {
        setProjects([]);
        setTargetGrade('');
        setIsWeightValid(true);
    };

    const calculateOverallGrade = () => {
        let totalAchieved = 0;
        let totalWeight = 0;

        projects.forEach((project) => {
            const projectWeight = parseFloat(project.overall) || 0;
            let projectScore = 0;
            let projectWeightReceived = 0;

            project.sprints.forEach((sprint) => {
                const sprintScore = parseFloat(sprint.score) || 0;
                const sprintWeight = parseFloat(sprint.weight) || 0;
                projectScore += (sprintScore * sprintWeight) / 100;
                projectWeightReceived += sprintWeight;
            });

            projectScore = projectWeightReceived > 0 ? projectScore / projectWeightReceived : 0;
            totalAchieved += projectScore * projectWeight;
            totalWeight += projectWeight;
        });

        return totalWeight > 0 ? ((totalAchieved / totalWeight) * 100).toFixed(2) : '0.00';
    };

    const calculateFutureWeightTotal = useCallback(() => {
        let totalWeightReceived = 0;

        projects.forEach((project) => {
            const overall = parseFloat(project.overall) || 0;
            totalWeightReceived += overall;
        });

        return (100 - totalWeightReceived).toFixed(2);
    }, [projects]);

    const calculateRequiredFutureScore = useCallback(() => {
        if (!targetGrade || isNaN(targetGrade)) return 'N/A';

        const futureWeightTotal = parseFloat(calculateFutureWeightTotal());
        let totalAchieved = 0;
        let totalWeight = 0;

        projects.forEach((project) => {
            const projectWeight = parseFloat(project.overall) || 0;
            let projectScore = 0;
            let projectWeightReceived = 0;

            project.sprints.forEach((sprint) => {
                const sprintScore = parseFloat(sprint.score) || 0;
                const sprintWeight = parseFloat(sprint.weight) || 0;
                projectScore += (sprintScore * sprintWeight) / 100;
                projectWeightReceived += sprintWeight;
            });

            projectScore = projectWeightReceived > 0 ? projectScore / projectWeightReceived : 0;
            totalAchieved += projectScore * projectWeight;
            totalWeight += projectWeight;
        });

        const requiredTotal = (targetGrade * (totalWeight + futureWeightTotal)) / 100;
        const requiredFutureScore = ((requiredTotal - totalAchieved) / futureWeightTotal) * 100;

        return isFinite(requiredFutureScore) ? requiredFutureScore.toFixed(2) : 'N/A';
    }, [targetGrade, projects, calculateFutureWeightTotal]);

    useEffect(() => {
        setShowAlert(() => {
            const requiredFutureScore = calculateRequiredFutureScore();
            return targetGrade && targetGrade !== '' && (requiredFutureScore === 'N/A' || requiredFutureScore > 100);
        });
    }, [targetGrade, projects, calculateRequiredFutureScore]);

    return (
        <div className="grade-calculator">
            <p className="title">Input your Project, Weight, Grade, & Sprint Weight</p>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="projects">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {projects.map((project, projectIndex) => (
                                <Draggable key={project.id} draggableId={project.id} index={projectIndex}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="draggable-project"
                                        >
                                            <div className="project">
                                                <input
                                                    className="input project-name"
                                                    type="text"
                                                    value={project.name}
                                                    onChange={(e) =>
                                                        handleProjectChange(projectIndex, 'name', e.target.value)
                                                    }
                                                    placeholder="Project Name"
                                                />
                                                <input
                                                    className="input project-overall"
                                                    type="number"
                                                    step="0.01"
                                                    value={project.overall}
                                                    onChange={(e) =>
                                                        handleProjectChange(projectIndex, 'overall', e.target.value)
                                                    }
                                                    onBlur={() => handleProjectBlur(projectIndex)}
                                                    placeholder="Project Overall Weight (%)"
                                                />
                                                {project.sprints.map((sprint, sprintIndex) => (
                                                    <div key={sprint.id} className="sprint-container">
                                                        <input
                                                            className="input sprint-score"
                                                            type="number"
                                                            step="0.01"
                                                            value={sprint.score}
                                                            onChange={(e) =>
                                                                handleSprintChange(
                                                                    projectIndex,
                                                                    sprintIndex,
                                                                    'score',
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Sprint Grade Received (%)"
                                                        />
                                                        <input
                                                            className="input sprint-weight"
                                                            type="number"
                                                            step="0.01"
                                                            value={sprint.weight}
                                                            onChange={(e) =>
                                                                handleSprintChange(
                                                                    projectIndex,
                                                                    sprintIndex,
                                                                    'weight',
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Sprint Weight (%)"
                                                        />
                                                        <button
                                                            className="button delete-sprint"
                                                            onClick={() => handleDeleteSprint(projectIndex, sprintIndex)}
                                                        >
                                                            Delete Sprint
                                                        </button>
                                                    </div>
                                                ))}
                                                <div className="buttons-container">
                                                    <button
                                                        className="button add-sprint"
                                                        onClick={() => handleAddSprint(projectIndex)}
                                                    >
                                                        Add Sprint
                                                    </button>
                                                    <button
                                                        className="button delete-project"
                                                        onClick={() => handleDeleteProject(projectIndex)}
                                                    >
                                                        Delete Project
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
            <button className="button add-project" onClick={handleAddProject}>
                Add Project
            </button>
            {!isWeightValid && (
                <div className="alert">
                    Total project weights cannot exceed 100%.
                </div>
            )}
            {isWeightValid && (
                <div className="current-grade">Current Grade: {calculateOverallGrade()}%</div>
            )}
            <div className="target-grade-container">
                <label className="target-grade-label">
                    Target Grade:
                    <input
                        className="input input__target-grade"
                        type="number"
                        step="0.01"
                        value={targetGrade}
                        onChange={(e) => setTargetGrade(e.target.value)}
                        placeholder="Target Grade in %"
                    />
                </label>
            </div>
            <div className="future-weight-container">
                <span className="future-weight-label">Future Weight Total Left (%): </span>
                <span className="future-weight-value">{calculateFutureWeightTotal()}</span>
            </div>
            <div className="required-future-score">
                Required Grade (%) per Future Project to Attain Target: {calculateRequiredFutureScore()}%
            </div>
            {showAlert && (
                <div className="alert">
                    Required Grade (%) per Future Project cannot exceed 100%.
                </div>
            )}
            <button className="button button-reset" onClick={handleReset}>
                Reset All Grades
            </button>
        </div>
    );
}

export default GradesCalculator;