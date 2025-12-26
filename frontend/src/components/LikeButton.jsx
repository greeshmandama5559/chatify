import React from 'react';
import styled from 'styled-components';

const LikeButton = ({ liked, onToggle, disabled }) => {
  return (
    <StyledWrapper>
      <div className="heart-container" title="Like">
        <input
          type="checkbox"
          className="checkbox"
          checked={liked}
          onChange={onToggle}
          disabled={disabled}
        />

        <div className="svg-container">
          {/* Outline heart */}
          <svg viewBox="0 0 24 24" className="svg-outline">
            <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z" />
          </svg>

          {/* Filled heart */}
          <svg viewBox="0 0 24 24" className="svg-filled">
            <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z" />
          </svg>

          {/* Celebration */}
          <svg className="svg-celebrate" width={100} height={100}>
            <polygon points="10,10 20,20" />
            <polygon points="10,50 20,50" />
            <polygon points="20,80 30,70" />
            <polygon points="90,10 80,20" />
            <polygon points="90,50 80,50" />
            <polygon points="80,80 70,70" />
          </svg>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .heart-container {
    --heart-color: rgb(255, 91, 137);
    position: relative;
    width: 20px;
    height: 20px;
    transition: .3s;
  }

  .heart-container .checkbox {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: 20;
    cursor: pointer;
  }

  .heart-container .svg-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Outline heart should be hollow */
  .heart-container .svg-outline {
    fill: none;
    stroke: var(--heart-color);
    stroke-width: 1px;
    position: absolute;
  }

  /* Filled heart only shows when checked */
  .heart-container .svg-filled {
    fill: var(--heart-color);
    position: absolute;
    animation: keyframes-svg-filled 1s;
    display: none;
  }

  .heart-container .svg-celebrate {
    position: absolute;
    animation: keyframes-svg-celebrate .5s;
    animation-fill-mode: forwards;
    display: none;
    stroke: var(--heart-color);
    fill: var(--heart-color);
    stroke-width: 2px;
  }

  .heart-container .checkbox:checked ~ .svg-container .svg-filled {
    display: block;
  }

  .heart-container .checkbox:checked ~ .svg-container .svg-celebrate {
    display: block;
  }

  @keyframes keyframes-svg-filled {
    0% { transform: scale(0); }
    25% { transform: scale(1.2); }
    50% { transform: scale(1); filter: brightness(1.5); }
  }

  @keyframes keyframes-svg-celebrate {
    0% { transform: scale(0); }
    50% { opacity: 1; filter: brightness(1.5); }
    100% { transform: scale(1.4); opacity: 0; display: none; }
  }
`;

export default LikeButton;
