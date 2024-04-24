import React, { useState, useEffect, useCallback } from 'react';
import "./GradesCalculator.scss";

function GradesCalculator() {
    const [projects, setProjects] = useState(() => {
        const savedProjects = localStorage.getItem('projects');
        return savedProjects ? JSON.parse(savedProjects) : [];
    });
    const [targetGrade, setTargetGrade] = useState('');
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        localStorage.setItem('projects', JSON.stringify(projects));
    }, [projects]);

    const handleAddProject = () => {
        const newProject = {
            id: projects.length, 
            name: '', 
            overall: '', 
            sprints: [{ id: 0, score: '', weight: '' }]
        };
        setProjects([...projects, newProject]);
    };

    const handleAddSprint = (projectIndex) => {
        const newSprint = { id: projects[projectIndex].sprints.length, score: '', weight: '' };
        const updatedProjects = projects.map((project, index) => 
            index === projectIndex ? { ...project, sprints: [...project.sprints, newSprint] } : project
        );
        setProjects(updatedProjects);
    };

    const handleProjectChange = (projectIndex, field, value) => {
        const updatedProjects = projects.map((project, index) => 
            index === projectIndex ? { ...project, [field]: value } : project
        );
        setProjects(updatedProjects);
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
    };

    const calculateOverallGrade = () => {
        let totalAchieved = 0;
        let totalWeight = 0;

        projects.forEach(project => {
            const projectWeight = parseFloat(project.overall) || 0;
            let projectScore = 0;
            let projectWeightReceived = 0;

            project.sprints.forEach(sprint => {
                const sprintScore = parseFloat(sprint.score) || 0;
                const sprintWeight = parseFloat(sprint.weight) || 0;
                projectScore += (sprintScore * sprintWeight) / 100;
                projectWeightReceived += sprintWeight;
            });

            projectScore = projectWeightReceived > 0 ? (projectScore / projectWeightReceived) : 0;
            totalAchieved += (projectScore * projectWeight);
            totalWeight += projectWeight;
        });

        return totalWeight > 0 ? ((totalAchieved / totalWeight) * 100).toFixed(2) : '0.00';
    };

    const calculateFutureWeightTotal = useCallback(() => {
        let totalWeightReceived = 0;
    
        projects.forEach(project => {
            const overall = parseFloat(project.overall) || 0;
            totalWeightReceived += overall;
        });
    
        return (100 - totalWeightReceived).toFixed(2);
    }, [projects]);

    const calculateRequiredFutureScore = useCallback(() => {
        if (!targetGrade || isNaN(targetGrade)) return "N/A";
    
        const futureWeightTotal = parseFloat(calculateFutureWeightTotal());
        let totalAchieved = 0;
        let totalWeight = 0;
    
        projects.forEach(project => {
            const projectWeight = parseFloat(project.overall) || 0;
            let projectScore = 0;
            let projectWeightReceived = 0;
    
            project.sprints.forEach(sprint => {
                const sprintScore = parseFloat(sprint.score) || 0;
                const sprintWeight = parseFloat(sprint.weight) || 0;
                projectScore += (sprintScore * sprintWeight) / 100;
                projectWeightReceived += sprintWeight;
            });
    
            projectScore = projectWeightReceived > 0 ? (projectScore / projectWeightReceived) : 0;
            totalAchieved += (projectScore * projectWeight);
            totalWeight += projectWeight;
        });
    
        const requiredTotal = targetGrade * (totalWeight + futureWeightTotal) / 100;
        const requiredFutureScore = (requiredTotal - totalAchieved) / futureWeightTotal * 100;
    
        return isFinite(requiredFutureScore) ? requiredFutureScore.toFixed(2) : "N/A";
    }, [targetGrade, projects, calculateFutureWeightTotal]);    

    useEffect(() => {
        setShowAlert(prevShowAlert => {
            const requiredFutureScore = calculateRequiredFutureScore(); // Include calculateRequiredFutureScore
            return targetGrade && targetGrade !== '' && (requiredFutureScore === "N/A" || requiredFutureScore > 100);
        }); // Show alert if targetGrade is provided, and required future score exceeds 100 or is "N/A"
    }, [targetGrade, projects, calculateRequiredFutureScore]);    
    
    return (
      <div className="grade-calculator">
          <p className='title'>Input your Project, the Weight % and your Grade %</p>
          {projects.map((project, projectIndex) => (
              <div key={project.id} className="project">
                  <input
                      className="input project-name"
                      type="text"
                      value={project.name}
                      onChange={(e) => handleProjectChange(projectIndex, 'name', e.target.value)}
                      placeholder="Project Name"
                  />
                  <input
                      className="input project-overall"
                      type="text"
                      value={project.overall}
                      onChange={(e) => handleProjectChange(projectIndex, 'overall', e.target.value)}
                      placeholder="Project Overall Weight (%)"
                  />
                  {project.sprints.map((sprint, sprintIndex) => (
                      <div key={sprint.id} className="sprint-container">
                          <input
                              className="input sprint-score"
                              type="text"
                              value={sprint.score}
                              onChange={(e) => handleSprintChange(projectIndex, sprintIndex, 'score', e.target.value)}
                              placeholder="Sprint Grade Received (%)"
                          />
                          <input
                              className="input sprint-weight"
                              type="text"
                              value={sprint.weight}
                              onChange={(e) => handleSprintChange(projectIndex, sprintIndex, 'weight', e.target.value)}
                              placeholder="Sprint Weight (%)"
                          />
                          <button className="button delete-sprint" onClick={() => handleDeleteSprint(projectIndex, sprintIndex)}>Delete Sprint</button>
                      </div>
                  ))}
                  {/* Single "Add Sprint" button per project */}
                  <button className="button add-sprint" onClick={() => handleAddSprint(projectIndex)}>Add Sprint</button>
                  <button className="button delete-project" onClick={() => handleDeleteProject(projectIndex)}>Delete Project</button>
              </div>
          ))}
          <button className="button add-project" onClick={handleAddProject}>Add Project</button>
          <div className="current-grade">Current Grade: {calculateOverallGrade()}%</div>
          <div className="target-grade-container">
              <label className="target-grade-label">
                  Target Grade:
                  <input
                      className="input input__target-grade"
                      type="number"
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
          <button className="button button-reset" onClick={handleReset}>Reset</button>
      </div>
  );
}

export default GradesCalculator;
