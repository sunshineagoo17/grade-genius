import { useState, useEffect } from 'react';
import "./GradesCalculator.scss";

function GradesCalculator() {
    const [projects, setProjects] = useState(() => {
        const savedProjects = sessionStorage.getItem('projects');
        return savedProjects ? JSON.parse(savedProjects) : [];
    });
    const [targetGrade, setTargetGrade] = useState('');

    useEffect(() => {
        sessionStorage.setItem('projects', JSON.stringify(projects));
    }, [projects]);

    const handleAddProject = () => {
        const newProject = {
            id: projects.length, 
            name: '', 
            overall: '', 
            sprints: [{ id: 0, score: '' }]
        };
        setProjects([...projects, newProject]);
    };

    const handleAddSprint = (projectIndex) => {
        const newSprint = { id: projects[projectIndex].sprints.length, score: '' };
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

    const handleSprintChange = (projectIndex, sprintIndex, value) => {
        const updatedProjects = projects.map((project, pIndex) => {
            if (pIndex === projectIndex) {
                const updatedSprints = project.sprints.map((sprint, sIndex) => 
                    sIndex === sprintIndex ? { ...sprint, score: value } : sprint
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

            project.sprints.forEach(sprint => {
                const sprintScore = parseFloat(sprint.score) || 0;
                projectScore += sprintScore;
            });

            projectScore = project.sprints.length > 0 ? (projectScore / project.sprints.length) : 0;
            totalAchieved += (projectScore * projectWeight) / 100;
            totalWeight += projectWeight;
        });

        return totalWeight > 0 ? ((totalAchieved / totalWeight) * 100).toFixed(2) : '0.00';
    };

    const calculateFutureWeightTotal = () => {
        let totalWeightReceived = 0;

        projects.forEach(project => {
            const overall = parseFloat(project.overall) || 0;
            totalWeightReceived += overall;
        });

        return (100 - totalWeightReceived).toFixed(2);
    };

    const calculateRequiredFutureScore = () => {
        if (!targetGrade || isNaN(targetGrade)) return "N/A";

        const futureWeightTotal = parseFloat(calculateFutureWeightTotal());
        let totalAchieved = 0;
        let totalWeight = 0;

        projects.forEach(project => {
            const projectWeight = parseFloat(project.overall) || 0;
            let projectScore = 0;

            project.sprints.forEach(sprint => {
                const sprintScore = parseFloat(sprint.score) || 0;
                projectScore += sprintScore;
            });

            projectScore = project.sprints.length > 0 ? (projectScore / project.sprints.length) : 0;
            totalAchieved += (projectScore * projectWeight) / 100;
            totalWeight += projectWeight;
        });

        const requiredTotal = targetGrade * (totalWeight + futureWeightTotal) / 100;
        const requiredFutureScore = (requiredTotal - totalAchieved) / futureWeightTotal * 100;

        return isFinite(requiredFutureScore) ? requiredFutureScore.toFixed(2) : "N/A";
    };

    return (
      <div className="grade-calculator">
          <p className='title'>Input your Project, the Weight % and your Grade</p>
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
                              onChange={(e) => handleSprintChange(projectIndex, sprintIndex, e.target.value)}
                              placeholder="Sprint Grade Received (%)"
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
          <div className="current-grade"><b>Current Grade: {calculateOverallGrade()}%</b></div>
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
              Required Percentage per Future Project: {calculateRequiredFutureScore()}%
          </div>
          <button className="button button-reset" onClick={handleReset}>Reset</button>
      </div>
  );
}

export default GradesCalculator;
