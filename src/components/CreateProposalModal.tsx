import React, { useState } from 'react';
import { proposalService } from '../services/proposalService';
import { ProposalType } from '../types/proposal';

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export const CreateProposalModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProposalType>('UPGRADE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title || !description) {
      setError('Title and description are required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await proposalService.createProposal({ 
        title, 
        description, 
        type, 
        author: 'currentUser' 
      });
      onCreated();
      onClose();
    } catch (err) {
      setError('Failed to create proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal">
      <h2>Create Proposal</h2>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <input 
        value={title} 
        onChange={e => setTitle(e.target.value)} 
        placeholder="Title" 
        disabled={isSubmitting}
      />
      <textarea 
        value={description} 
        onChange={e => setDescription(e.target.value)} 
        placeholder="Description" 
        disabled={isSubmitting}
      />
      <select 
        value={type} 
        onChange={e => setType(e.target.value as ProposalType)}
        disabled={isSubmitting}
      >
        <option value="UPGRADE">Upgrade</option>
        <option value="FUNDING">Funding</option>
        <option value="PARAMETER_CHANGE">Parameter Change</option>
      </select>
      
      <button 
        onClick={handleSubmit} 
        disabled={isSubmitting}
        className={isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
      <button 
        onClick={onClose}
        disabled={isSubmitting}
      >
        Cancel
      </button>
    </div>
  );
};
