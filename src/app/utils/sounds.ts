export const playSound = (soundType: 'win' | 'loss' | 'point', fireBetLevel?: number): void => {
  try {
    let audioPath: string;
    let normalizedVolume: number;
    
    switch (soundType) {
      case 'win':
        audioPath = '/sounds/Win.mp3';
        normalizedVolume = .7; // Win sound might be quieter, boost it
        break;
      case 'loss':
        audioPath = '/sounds/Losing.mp3';
        normalizedVolume = 0.4; // Loss sound might be louder, reduce it
        break;
      case 'point':
        // Use different FireBet sounds based on level
        if (fireBetLevel && fireBetLevel >= 4) {
          audioPath = '/sounds/FireBet4-6.mp3';
        } else {
          audioPath = '/sounds/FireBet1-3.mp3';
        }
        normalizedVolume = 1; // Point sound at standard volume
        break;
      default:
        return;
    }
    
    const audio = new Audio(audioPath);
    
    // Fade in effect
    audio.volume = 0;
    audio.play().then(() => {
      // Fade in over 200ms
      const fadeInDuration = 200;
      const fadeInSteps = 20;
      const volumeStep = normalizedVolume / fadeInSteps;
      const stepDuration = fadeInDuration / fadeInSteps;
      
      let currentStep = 0;
      const fadeInInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.min(normalizedVolume, currentStep * volumeStep);
        
        if (currentStep >= fadeInSteps) {
          clearInterval(fadeInInterval);
          
          // Start fade out when audio is about to end
          audio.addEventListener('timeupdate', () => {
            const timeLeft = audio.duration - audio.currentTime;
            if (timeLeft <= 0.5) { // Start fade out 500ms before end
              const fadeOutDuration = 500;
              const fadeOutSteps = 20;
              const volumeStep = audio.volume / fadeOutSteps;
              const stepDuration = fadeOutDuration / fadeOutSteps;
              
              let fadeOutStep = 0;
              const fadeOutInterval = setInterval(() => {
                fadeOutStep++;
                audio.volume = Math.max(0, audio.volume - volumeStep);
                
                if (fadeOutStep >= fadeOutSteps) {
                  clearInterval(fadeOutInterval);
                }
              }, stepDuration);
            }
          });
        }
      }, stepDuration);
    }).catch(error => {
      console.warn('Failed to play sound:', error);
    });
  } catch (error) {
    console.warn('Error playing sound:', error);
  }
}; 